package com.noisevisionsoftware.vitema.service;

import com.noisevisionsoftware.vitema.exception.NotFoundException;
import com.noisevisionsoftware.vitema.model.user.User;
import com.noisevisionsoftware.vitema.model.user.UserRole;
import com.noisevisionsoftware.vitema.repository.UserRepository;
import com.noisevisionsoftware.vitema.security.model.FirebaseUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

// ===== Klasa serwisowa do zarządzania użytkownikami =====

/**
 * Klasa serwisowa odpowiedzialna za zarządzanie danymi użytkowników
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public List<User> getClientsForTrainer(String loggedInTrainerId) {
        return userRepository.findAllByTrainerId(loggedInTrainerId);
    }

    // ===== Autoryzacja użytkowników =====

    public List<User> getUsersBasedOnRole(String requesterId, UserRole role) {
        if (role == UserRole.ADMIN || role == UserRole.OWNER) {
            return userRepository.findAll();
        } else if (role == UserRole.TRAINER) {
            return userRepository.findAllByTrainerId(requesterId);
        } else {
            return Collections.emptyList();
        }
    }

    public String getCurrentUserId() {
        FirebaseUser firebaseUser = getFirebaseUser();
        return firebaseUser != null ? firebaseUser.getUid() : null;
    }

    public User getCurrentUser() {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            throw new IllegalStateException("Użytkownik nie jest zalogowany");
        }
        return getUserById(currentUserId);
    }

    /**
     * Weryfikowanie, czy użytkownik ma rangę admin lub owner
     */
    public boolean isCurrentUserAdminOrOwner() {
        FirebaseUser firebaseUser = getFirebaseUser();
        if (firebaseUser != null) {
            String role = firebaseUser.getRole();
            return UserRole.ADMIN.name().equals(role) || UserRole.OWNER.name().equals(role);
        }
        return false;
    }

    /**
     * Weryfikowanie ID użytkownika
     */
    public boolean existsById(String userId) {
        try {
            return getUserById(userId) != null;
        } catch (NotFoundException e) {
            return false;
        }
    }

    /**
     * Weryfikowanie, czy dany użytkownik jest adminem
     */
    public boolean isAdmin(String userId) {
        return UserRole.ADMIN.equals(getUserRole(userId));
    }

    // Wydzielenie logiki autoryzacji, w celu zastosowania zasady DRY
    private FirebaseUser getFirebaseUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof FirebaseUser) {
            return (FirebaseUser) authentication.getPrincipal();
        }
        return null;
    }

    // ===== Logika zarządzająca cache =====

    /**
     * Pobieranie wszystkich użytkowników
     */
    @Cacheable(value = "usersCache", key = "'allUsers'")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Pobieranie pojedynczego użytkownika za pomocą jego ID
     */
    @Cacheable(value = "usersCache", key = "#id")
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    /**
     * Pobieranie email od danego użytkownika
     */
    @Cacheable(value = "userEmailCache", key = "#userId")
    public String getUserEmail(String userId) {
        try {
            User user = getUserById(userId);
            return user.getEmail();
        } catch (Exception e) {
            log.error("Error fetching user email for userId: {}", userId, e);
            return "Nieznany użytkownik";
        }
    }

    // Dodanie adnotacji @Transactional, dla bezpieczeństwa,
    // gdy pojawią się jakieś komplikacje w trakcie aktualizacji danych użytkownika
    /**
     * Aktualizowanie danych użytkownika takich jak ID, email, rola
     */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "usersCache", key = "#id"),
            @CacheEvict(value = "usersCache", key = "'allUsers'"),
            @CacheEvict(value = "userEmailCache", key = "#id"),
            @CacheEvict(value = "userRoles", key = "#id")
    })
    public User updateUser(String id, User updatedUser) {
        User existingUser = getUserById(id);

        updatedUser.setId(id);
        updatedUser.setEmail(existingUser.getEmail());
        updatedUser.setRole(existingUser.getRole());
        updatedUser.setCreatedAt(existingUser.getCreatedAt());

        return userRepository.save(updatedUser);
    }

    // Dodanie adnotacji @Transactional, dla bezpieczeństwa,
    // gdy pojawią się jakieś komplikacje w trakcie edycji notatki użytkownika
    /**
     * Aktualizowanie notatki użytkownika
     */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "usersCache", key = "#id"),
            @CacheEvict(value = "usersCache", key = "'allUsers'")
    })
    public User updateUserNote(String id, String note) {
        User user = getUserById(id);
        user.setNote(note);
        userRepository.update(id, user);
        return user;
    }

    /**
     * Pobieranie roli użytkownika
     */
    @Cacheable(value = "userRoles", key = "#userId")
    public UserRole getUserRole(String userId) {
        try {
            User user = getUserById(userId);
            return user.getRole();
        } catch (Exception e) {
            log.error("Error fetching user role for userId: {}", userId, e);
            return UserRole.USER;
        }
    }
}