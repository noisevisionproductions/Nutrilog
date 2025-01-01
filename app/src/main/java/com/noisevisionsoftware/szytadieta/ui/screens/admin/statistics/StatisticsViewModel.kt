package com.noisevisionsoftware.szytadieta.ui.screens.admin.statistics

import com.noisevisionsoftware.szytadieta.domain.alert.AlertManager
import com.noisevisionsoftware.szytadieta.domain.model.AppStatistics
import com.noisevisionsoftware.szytadieta.domain.network.NetworkConnectivityManager
import com.noisevisionsoftware.szytadieta.domain.repository.StatisticsRepository
import com.noisevisionsoftware.szytadieta.domain.state.ViewModelState
import com.noisevisionsoftware.szytadieta.ui.base.BaseViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class StatisticsViewModel @Inject constructor(
    private val statisticsRepository: StatisticsRepository,
    networkManager: NetworkConnectivityManager,
    alertManager: AlertManager
) : BaseViewModel(networkManager, alertManager) {

    private val _statisticsState =
        MutableStateFlow<ViewModelState<AppStatistics>>(ViewModelState.Initial)
    val statisticsState = _statisticsState.asStateFlow()

    fun loadStatistics() {
        handleOperation(_statisticsState) {
            statisticsRepository.getStatistics()
                .getOrThrow()
        }
    }
}