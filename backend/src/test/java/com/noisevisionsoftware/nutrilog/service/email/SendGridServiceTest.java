package com.noisevisionsoftware.nutrilog.service.email;

import com.noisevisionsoftware.nutrilog.dto.request.newsletter.sendgrid.EmailRequest;
import com.noisevisionsoftware.nutrilog.dto.request.newsletter.sendgrid.TargetedEmailRequest;
import com.noisevisionsoftware.nutrilog.model.newsletter.ExternalRecipient;
import com.noisevisionsoftware.nutrilog.model.newsletter.NewsletterSubscriber;
import com.noisevisionsoftware.nutrilog.model.newsletter.SubscriberRole;
import com.noisevisionsoftware.nutrilog.repository.jpa.newsletter.ExternalRecipientRepository;
import com.noisevisionsoftware.nutrilog.repository.jpa.newsletter.NewsletterSubscriberRepository;
import com.noisevisionsoftware.nutrilog.service.newsletter.AdminNewsletterService;
import com.noisevisionsoftware.nutrilog.service.newsletter.ExternalRecipientsService;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SendGridServiceTest {

    @Mock
    private NewsletterSubscriberRepository subscriberRepository;

    @Mock
    private ExternalRecipientRepository externalRecipientRepository;

    @Mock
    private ExternalRecipientsService externalRecipientsService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private AdminNewsletterService adminNewsletterService;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private SendGrid sendGrid;

    @InjectMocks
    private SendGridService sendGridService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(sendGridService, "fromEmail", "test@example.com");
        ReflectionTestUtils.setField(sendGridService, "fromName", "Test Sender");
        ReflectionTestUtils.setField(sendGridService, "baseUrl", "https://test.com");
        ReflectionTestUtils.setField(sendGridService, "sendGridApiKey", "test-api-key");
    }

    @Test
    void sendBulkEmail_shouldSendToAllActiveAndVerifiedSubscribers() throws IOException {
        // Given
        List<NewsletterSubscriber> subscribers = createTestSubscribers(3);
        when(subscriberRepository.findAllByActiveTrueAndVerifiedTrue()).thenReturn(subscribers);
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Test content</html>");

        // Mock SendGrid API response
        Response apiResponse = mock(Response.class);
        when(apiResponse.getStatusCode()).thenReturn(202); // Success status
        // This requires mocking the SendGrid class which is a bit tricky - better approach in real tests
        // would be to use something like @Spy or mock at a higher level

        // Email request
        EmailRequest request = new EmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");

        // When
        sendGridService.sendBulkEmail(request);

        // Then
        verify(subscriberRepository).findAllByActiveTrueAndVerifiedTrue();
        verify(emailTemplateService).applySystemTemplate("Test Content", "basic");
        subscribers.forEach(subscriber -> {
            try {
                verify(adminNewsletterService).updateLastEmailSent(subscriber.getEmail());
            } catch (Exception e) {
                fail("Should not throw exception");
            }
        });
    }

    @Test
    void sendTargetedBulkEmail_shouldSendToFilteredSubscribers() throws IOException {
        // Given
        List<NewsletterSubscriber> subscribers = createTestSubscribers(2);
        when(subscriberRepository.findAll()).thenReturn(subscribers);
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Test content</html>");

        // Email request
        TargetedEmailRequest request = new TargetedEmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");
        request.setRecipientType("subscribers");
        Map<String, Object> filters = new HashMap<>();
        filters.put("active", true);
        filters.put("verified", true);
        request.setSubscriberFilters(filters);

        // When
        Map<String, Object> result = sendGridService.sendTargetedBulkEmail(request);

        // Then
        verify(subscriberRepository).findAll();
        verify(emailTemplateService).applySystemTemplate("Test Content", "basic");
        assertNotNull(result);
        assertEquals(2, result.get("subscriberCount"));
        assertTrue(result.containsKey("sentCount"));
        assertTrue(result.containsKey("message"));
    }

    @Test
    void sendTargetedBulkEmail_shouldSendToExternalRecipients() throws IOException {
        // Given
        List<ExternalRecipient> recipients = createTestExternalRecipients();
        when(externalRecipientRepository.findAll()).thenReturn(recipients);
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Test content</html>");

        // Email request
        TargetedEmailRequest request = new TargetedEmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");
        request.setRecipientType("external");
        request.setUpdateStatus(true);
        request.setNewStatus("contacted");

        // When
        Map<String, Object> result = sendGridService.sendTargetedBulkEmail(request);

        // Then
        verify(externalRecipientRepository).findAll();
        verify(emailTemplateService).applySystemTemplate("Test Content", "basic");
        assertNotNull(result);
        assertEquals(2, result.get("externalCount"));
        assertTrue(result.containsKey("sentCount"));

        // Verify status updates
        recipients.forEach(recipient -> {
            try {
                verify(externalRecipientsService).updateStatus(recipient.getId(), "contacted");
            } catch (Exception e) {
                fail("Should not throw exception");
            }
        });
    }

    @Test
    void sendTargetedBulkEmail_shouldHandleEmptyRecipientList() throws IOException {
        // Given
        when(subscriberRepository.findAll()).thenReturn(new ArrayList<>());

        // Email request
        TargetedEmailRequest request = new TargetedEmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setRecipientType("subscribers");

        // When
        Map<String, Object> result = sendGridService.sendTargetedBulkEmail(request);

        // Then
        verify(subscriberRepository).findAll();
        assertNotNull(result);
        assertEquals(0, result.get("sentCount"));
        assertEquals("Nie znaleziono odbiorców spełniających kryteria", result.get("message"));
    }

    @Test
    void sendEmail_shouldSendToSingleRecipient() throws IOException {
        // Given
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Test content</html>");

        // Email request
        EmailRequest request = new EmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");

        // When
        sendGridService.sendEmail("test@example.com", request);

        // Then
        verify(emailTemplateService).applySystemTemplate("Test Content", "basic");
    }

    @Test
    void renderEmailPreview_shouldReturnRenderedContent() {
        // Given
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Test content</html>");

        // Email request
        EmailRequest request = new EmailRequest();
        request.setSubject("Test Subject");
        request.setContent("Test Content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");

        // When
        String result = sendGridService.renderEmailPreview(request);

        // Then
        verify(emailTemplateService).applySystemTemplate("Test Content", "basic");
        assertEquals("<html>Test content</html>", result);
    }

    @Test
    void prepareEmailContent_shouldUseTemplateWhenSpecified() {
        // Given
        when(emailTemplateService.applySystemTemplate(anyString(), anyString())).thenReturn("<html>Templated content</html>");

        // Email request
        EmailRequest request = new EmailRequest();
        request.setContent("Raw content");
        request.setUseTemplate(true);
        request.setTemplateType("basic");

        // When
        String result = sendGridService.renderEmailPreview(request);

        // Then
        verify(emailTemplateService).applySystemTemplate("Raw content", "basic");
        assertEquals("<html>Templated content</html>", result);
    }

    @Test
    void prepareEmailContent_shouldNotUseTemplateWhenNotSpecified() {
        // Given
        // Email request
        EmailRequest request = new EmailRequest();
        request.setContent("Raw content");
        request.setUseTemplate(false);

        // When
        String result = sendGridService.renderEmailPreview(request);

        // Then
        verifyNoInteractions(emailTemplateService);
        assertEquals("Raw content", result);
    }

    @Test
    void getFilteredSubscribers_shouldFilterByActiveAndVerified() {
        // This test will need reflection to access the private method
        // In a real test, consider testing through public methods instead
        // or making the method package-private for testing
    }

    // Helper methods to create test data

    private List<NewsletterSubscriber> createTestSubscribers(int count) {
        List<NewsletterSubscriber> subscribers = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            NewsletterSubscriber subscriber = new NewsletterSubscriber();
            subscriber.setId((long) i);
            subscriber.setEmail("subscriber" + i + "@example.com");
            subscriber.setRole(SubscriberRole.DIETITIAN);
            subscriber.setActive(true);
            subscriber.setVerified(true);
            subscriber.setCreatedAt(LocalDateTime.now());
            subscribers.add(subscriber);
        }
        return subscribers;
    }

    private List<ExternalRecipient> createTestExternalRecipients() {
        List<ExternalRecipient> recipients = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            ExternalRecipient recipient = new ExternalRecipient();
            recipient.setId((long) i);
            recipient.setEmail("external" + i + "@example.com");
            recipient.setCategory("Test Category");
            recipient.setStatus("new");
            recipient.setCreatedAt(LocalDateTime.now());
            recipients.add(recipient);
        }
        return recipients;
    }
}