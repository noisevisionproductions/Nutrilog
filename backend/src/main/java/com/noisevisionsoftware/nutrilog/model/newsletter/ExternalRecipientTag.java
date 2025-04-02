package com.noisevisionsoftware.nutrilog.model.newsletter;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "external_recipient_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExternalRecipientTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private ExternalRecipient recipient;

    @Column(nullable = false)
    private String tag;
}
