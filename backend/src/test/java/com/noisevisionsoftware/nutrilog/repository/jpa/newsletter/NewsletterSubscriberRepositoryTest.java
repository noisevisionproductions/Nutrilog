package com.noisevisionsoftware.nutrilog.repository.jpa.newsletter;

import com.noisevisionsoftware.nutrilog.model.newsletter.NewsletterSubscriber;
import com.noisevisionsoftware.nutrilog.model.newsletter.SubscriberRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class NewsletterSubscriberRepositoryTest {

    @Autowired
    private NewsletterSubscriberRepository subscriberRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldSaveSubscriberWithMetadata() {
        // given
        NewsletterSubscriber subscriber = NewsletterSubscriber.create("test@example.com", SubscriberRole.DIETITIAN);

        // Zapisz subskrybenta
        subscriberRepository.save(subscriber);

        entityManager.flush();
        entityManager.clear();

        // Znajdź zapisanego subskrybenta
        NewsletterSubscriber savedSubscriber = subscriberRepository.findByEmail("test@example.com").orElseThrow();

        if (savedSubscriber.getMetadataEntries() == null) {
            savedSubscriber.setMetadataEntries(new HashSet<>());
        }

        // Dodaj metadane
        Map<String, String> metadata = new HashMap<>();
        metadata.put("testKey", "testValue");
        metadata.put("anotherKey", "anotherValue");
        savedSubscriber.setMetadata(metadata);

        savedSubscriber.updateMetadata();

        // Zapisz zmiany
        subscriberRepository.save(savedSubscriber);

        entityManager.flush();
        entityManager.clear();

        // when
        NewsletterSubscriber subscriberWithMetadata = subscriberRepository.findByEmail("test@example.com").orElseThrow();

        // then
        assertThat(subscriberWithMetadata.getMetadata()).containsEntry("testKey", "testValue");
        assertThat(subscriberWithMetadata.getMetadata()).containsEntry("anotherKey", "anotherValue");

        // Sprawdź, czy metadane zostały zapisane w bazie
        assertThat(subscriberWithMetadata.getMetadataEntries()).hasSize(2);
    }
}