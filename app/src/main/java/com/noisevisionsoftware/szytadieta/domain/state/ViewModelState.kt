package com.noisevisionsoftware.szytadieta.domain.state

import com.noisevisionsoftware.szytadieta.domain.exceptions.PasswordField

sealed class ViewModelState<out T> {
    data object Initial : ViewModelState<Nothing>()
    data object Loading : ViewModelState<Nothing>()
    data class Success<T>(val data: T) : ViewModelState<T>()
    data class Error(
        val message: String,
        val field: PasswordField? = null
    ) : ViewModelState<Nothing>()}