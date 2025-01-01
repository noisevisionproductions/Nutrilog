package com.noisevisionsoftware.szytadieta.di
import android.os.Build
import androidx.annotation.RequiresApi
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.noisevisionsoftware.szytadieta.domain.repository.AdminRepository
import com.noisevisionsoftware.szytadieta.domain.repository.AuthRepository
import com.noisevisionsoftware.szytadieta.domain.repository.BodyMeasurementRepository
import com.noisevisionsoftware.szytadieta.domain.repository.StatisticsRepository
import com.noisevisionsoftware.szytadieta.domain.repository.WeightRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    @Provides
    @Singleton
    fun provideAuthRepository(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): AuthRepository = AuthRepository(auth, firestore)

    @Provides
    @Singleton
    fun provideWeightRepository(
        firestore: FirebaseFirestore
    ): WeightRepository = WeightRepository(firestore)

    @Provides
    @Singleton
    fun provideBodyMeasurementsRepository(
        firestore: FirebaseFirestore
    ): BodyMeasurementRepository = BodyMeasurementRepository(firestore)

    @Provides
    @Singleton
    fun provideAdminRepository(
        firestore: FirebaseFirestore
    ): AdminRepository = AdminRepository(firestore)

    @Provides
    @Singleton
    fun provideStatisticsRepository(
        firestore: FirebaseFirestore
    ): StatisticsRepository {
        return StatisticsRepository(firestore)
    }
}