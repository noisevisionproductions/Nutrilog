package com.noisevisionsoftware.vitema.service.invitation;

import com.noisevisionsoftware.vitema.model.invitation.Invitation;
import com.noisevisionsoftware.vitema.model.invitation.InvitationStatus;
import com.noisevisionsoftware.vitema.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvitationScheduler {

    private final InvitationRepository invitationRepository;

    /**
     * Automatically expires old invitations.
     * This method runs daily at 2:00 AM and updates all pending invitations
     * that have passed their expiration date to EXPIRED status.
     * <p>
     * Scheduled using cron expression: "0 0 2 * * ?" (second minute hour day month weekday)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void expireOldInvitations() {
        log.info("Starting automatic expiration of old invitations");

        try {
            long currentTime = Instant.now().toEpochMilli();
            List<Invitation> expiredInvitations = invitationRepository.findExpiredPendingInvitations(currentTime);

            if (expiredInvitations.isEmpty()) {
                log.info("No expired invitations found");
                return;
            }

            int successCount = 0;
            int failureCount = 0;

            for (Invitation invitation : expiredInvitations) {
                try {
                    invitation.setStatus(InvitationStatus.EXPIRED);
                    invitationRepository.update(invitation.getId(), invitation);
                    successCount++;
                    log.debug("Expired invitation: id={}, code={}, clientEmail={}",
                            invitation.getId(), invitation.getCode(), invitation.getClientEmail());
                } catch (Exception e) {
                    failureCount++;
                    log.error("Failed to expire invitation: id={}, code={}",
                            invitation.getId(), invitation.getCode(), e);
                }
            }

            log.info("Expired {} invitations successfully (failures: {})", successCount, failureCount);

        } catch (Exception e) {
            log.error("Error during automatic invitation expiration", e);
        }
    }
}