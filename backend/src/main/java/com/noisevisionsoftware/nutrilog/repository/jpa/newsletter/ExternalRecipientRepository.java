package com.noisevisionsoftware.nutrilog.repository.jpa.newsletter;

import com.noisevisionsoftware.nutrilog.model.newsletter.ExternalRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalRecipientRepository extends JpaRepository<ExternalRecipient, Long> {

    Optional<ExternalRecipient> findByEmail(String email);

    List<ExternalRecipient> findAllByOrderByCreatedAtDesc();

    List<ExternalRecipient> findAllByCategory(String category);

    List<ExternalRecipient> findAllByStatus(String status);

    @Query("SELECT DISTINCT e.category FROM ExternalRecipient e ORDER BY e.category")
    List<String> findAllCategories();

    @Query("SELECT e FROM ExternalRecipient e JOIN e.tags t WHERE t.tag IN :tags")
    List<ExternalRecipient> findAllByTags(List<String> tags);
}
