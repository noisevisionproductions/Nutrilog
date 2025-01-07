package com.noisevisionsoftware.szytadieta.ui.navigation

sealed class NavigationDestination {
    sealed class AuthenticatedDestination : NavigationDestination() {
        data object Dashboard : AuthenticatedDestination()
        data object MealPlan : AuthenticatedDestination()
        data object Profile : AuthenticatedDestination()
        data object Weight : AuthenticatedDestination()
        data object BodyMeasurements : AuthenticatedDestination()
        data object ShoppingList : AuthenticatedDestination()
        data object Settings : AuthenticatedDestination()
        data object AdminPanel : AuthenticatedDestination()
        data object CompleteProfile : AuthenticatedDestination()
    }

    sealed class UnauthenticatedDestination : NavigationDestination() {
        data object Login : UnauthenticatedDestination()
        data object Register : UnauthenticatedDestination()
        data object ForgotPassword : UnauthenticatedDestination()
    }
}