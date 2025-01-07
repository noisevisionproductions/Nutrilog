package com.noisevisionsoftware.szytadieta.utils

import android.content.Context
import android.content.Intent
import android.net.Uri

object UrlHandler {
    fun openUrl(context: Context, url: String) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(url)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}