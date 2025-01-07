package com.noisevisionsoftware.szytadieta.ui.screens.bodyMeasurements

import android.icu.util.Calendar
import com.google.firebase.auth.FirebaseUser
import com.noisevisionsoftware.szytadieta.domain.alert.AlertManager
import com.noisevisionsoftware.szytadieta.domain.exceptions.AppException
import com.noisevisionsoftware.szytadieta.domain.model.BodyMeasurements
import com.noisevisionsoftware.szytadieta.domain.model.MeasurementType
import com.noisevisionsoftware.szytadieta.domain.network.NetworkConnectivityManager
import com.noisevisionsoftware.szytadieta.domain.repository.AuthRepository
import com.noisevisionsoftware.szytadieta.domain.repository.BodyMeasurementRepository
import com.noisevisionsoftware.szytadieta.domain.state.ViewModelState
import com.noisevisionsoftware.szytadieta.ui.base.BaseViewModel
import com.noisevisionsoftware.szytadieta.ui.base.EventBus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class BodyMeasurementsViewModel @Inject constructor(
    private val bodyMeasurementsRepository: BodyMeasurementRepository,
    private val authRepository: AuthRepository,
    networkManager: NetworkConnectivityManager,
    alertManager: AlertManager,
    eventBus: EventBus
) : BaseViewModel(networkManager, alertManager, eventBus) {

    private val _measurementsState =
        MutableStateFlow<ViewModelState<List<BodyMeasurements>>>(ViewModelState.Initial)
    val measurementsState = _measurementsState.asStateFlow()

    init {
        getHistory()
    }

    fun addMeasurements(measurements: BodyMeasurements) {
        handleOperation(_measurementsState) {
            val currentUser = getCurrentUserOrThrow()

            val calendar = Calendar.getInstance()
            val updatedMeasurements = measurements.copy(
                userId = currentUser.uid,
                weekNumber = calendar.get(Calendar.WEEK_OF_YEAR),
                measurementType = MeasurementType.FULL_BODY
            )

            bodyMeasurementsRepository.addMeasurements(updatedMeasurements)
                .getOrThrow()

            showSuccess("Pomiary zostały zapisane")

            loadMeasurementsHistory()
        }
    }

    fun deleteMeasurement(measurementId: String) {
        handleOperation(_measurementsState) {
            bodyMeasurementsRepository.deleteMeasurement(measurementId)
                .getOrThrow()

            showSuccess("Pomyślnie usunięto pomiary")

            loadMeasurementsHistory()
        }
    }

    private fun getHistory(monthsBack: Int = 3) {
        handleOperation(_measurementsState) {
            loadMeasurementsHistory(monthsBack)
        }
    }

    private suspend fun loadMeasurementsHistory(monthsBack: Int = 3): List<BodyMeasurements> {
        val currentUser = getCurrentUserOrThrow()

        val calendar = Calendar.getInstance()
        val endDate = calendar.timeInMillis
        calendar.add(Calendar.MONTH, -monthsBack)
        val startDate = calendar.timeInMillis

        return bodyMeasurementsRepository.getMeasurementsHistory(
            currentUser.uid,
            startDate,
            endDate
        )
            .getOrThrow()
            .filter { it.measurementType == MeasurementType.FULL_BODY }
    }

    private fun getCurrentUserOrThrow(): FirebaseUser {
        return authRepository.getCurrentUser()
            ?: throw AppException.AuthException("Użytkownik nie jest zalogowany")
    }

    override fun onUserLoggedOut() {
        _measurementsState.value = ViewModelState.Initial
    }
}