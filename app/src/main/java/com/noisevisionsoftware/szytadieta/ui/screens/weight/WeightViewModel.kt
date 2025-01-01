package com.noisevisionsoftware.szytadieta.ui.screens.weight

import com.google.firebase.auth.FirebaseUser
import com.noisevisionsoftware.szytadieta.domain.alert.AlertManager
import com.noisevisionsoftware.szytadieta.domain.exceptions.AppException
import com.noisevisionsoftware.szytadieta.domain.model.BodyMeasurements
import com.noisevisionsoftware.szytadieta.domain.model.MeasurementType
import com.noisevisionsoftware.szytadieta.domain.network.NetworkConnectivityManager
import com.noisevisionsoftware.szytadieta.domain.repository.AuthRepository
import com.noisevisionsoftware.szytadieta.domain.repository.WeightRepository
import com.noisevisionsoftware.szytadieta.domain.state.ViewModelState
import com.noisevisionsoftware.szytadieta.ui.base.BaseViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class WeightViewModel @Inject constructor(
    private val weightRepository: WeightRepository,
    private val authRepository: AuthRepository,
    networkManager: NetworkConnectivityManager,
    alertManager: AlertManager
) : BaseViewModel(networkManager, alertManager) {

    private val _weightState =
        MutableStateFlow<ViewModelState<List<BodyMeasurements>>>(ViewModelState.Initial)
    val weightState = _weightState.asStateFlow()

    init {
        loadWeights()
    }

    fun addWeight(weight: Double, note: String = "") {
        if (weight <= 0) {
            _weightState.value = ViewModelState.Error("Waga musi być większa niż 0")
            return
        }

        handleOperation(_weightState) {
            val currentUser = getCurrentUserOrThrow()

            val bodyMeasurementsEntry = BodyMeasurements(
                userId = currentUser.uid,
                weight = weight,
                note = note,
                measurementType = MeasurementType.WEIGHT_ONLY
            )

            safeApiCall { weightRepository.addWeight(bodyMeasurementsEntry) }
                .onSuccess {
                    showSuccess("Pomyślnie dodano wagę")
                    loadWeights()
                }
                .onFailure { throwable ->
                    throw AppException.UnknownException(
                        throwable.message ?: "Błąd podczas dodawania wagi"
                    )
                }

            loadWeightsData()
        }
    }

    fun deleteWeight(weightId: String) {
        handleOperation(_weightState) {
            safeApiCall { weightRepository.deleteWeight(weightId) }
                .onSuccess {
                    showSuccess("Pomyślnie usunięto wpis")
                    loadWeights()
                }
                .onFailure { throwable ->
                    throw AppException.UnknownException(
                        throwable.message ?: "Błąd podczas usuwania wpisu"
                    )
                }

            loadWeightsData()
        }
    }

    private fun loadWeights() {
        handleOperation(_weightState) {
            loadWeightsData()
        }
    }

    private suspend fun loadWeightsData(): List<BodyMeasurements> {
        val currentUser = getCurrentUserOrThrow()

        return safeApiCall {
            weightRepository.getUserWeights(currentUser.uid)
                .map { measurements ->
                    measurements.filter { it.measurementType == MeasurementType.WEIGHT_ONLY }
                }
        }
            .getOrThrow()
    }

    private fun getCurrentUserOrThrow(): FirebaseUser {
        return authRepository.getCurrentUser()
            ?: throw AppException.AuthException("Użytkownik nie jest zalogowany")
    }
}