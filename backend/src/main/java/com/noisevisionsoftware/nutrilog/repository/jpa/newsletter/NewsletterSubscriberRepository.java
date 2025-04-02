package com.noisevisionsoftware.nutrilog.repository.jpa.newsletter;

import com.noisevisionsoftware.nutrilog.model.newsletter.NewsletterSubscriber;
import com.noisevisionsoftware.nutrilog.model.newsletter.SubscriberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {

    Optional<NewsletterSubscriber> findByEmail(String email);

    Optional<NewsletterSubscriber> findByVerificationToken(String token);

    List<NewsletterSubscriber> findAllByActiveTrue();

    List<NewsletterSubscriber> findAllByActiveTrueAndVerifiedTrue();

    List<NewsletterSubscriber> findAllByRole(SubscriberRole role);

    @Query("SELECT COUNT(s) FROM NewsletterSubscriber s WHERE s.active = true")
    long countActiveSubscribers();

    @Query("SELECT COUNT(s) FROM NewsletterSubscriber s WHERE s.verified = true")
    long countVerifiedSubscribers();

    @Query("SELECT COUNT(s) FROM NewsletterSubscriber s WHERE s.active = true AND s.verified = true")
    long countActiveVerifiedSubscribers();

    @Query("SELECT s.role, COUNT(s) FROM NewsletterSubscriber s GROUP BY s.role")
    List<Object[]> countByRole();
}
