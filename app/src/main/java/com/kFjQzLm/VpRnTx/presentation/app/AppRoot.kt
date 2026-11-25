package com.kFjQzLm.VpRnTx.presentation.app

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.kFjQzLm.VpRnTx.core.navigation.Screen
import com.kFjQzLm.VpRnTx.core.theme.BgBase
import com.kFjQzLm.VpRnTx.data.local.PalaceStore
import com.kFjQzLm.VpRnTx.presentation.game.GameScreen
import com.kFjQzLm.VpRnTx.presentation.gameover.GameOverScreen
import com.kFjQzLm.VpRnTx.presentation.menu.MenuScreen
import com.kFjQzLm.VpRnTx.presentation.splash.SplashScreen

@Composable
fun AppRoot() {
    val store = remember { PalaceStore() }
    var screen by remember { mutableStateOf<Screen>(Screen.Splash) }

    BackHandler(enabled = screen != Screen.Splash) {
        screen = if (screen == Screen.Game) Screen.Menu else Screen.Menu
    }

    Box(modifier = Modifier.fillMaxSize().background(BgBase)) {
        AnimatedContent(
            targetState = screen,
            transitionSpec = { fadeIn(tween(260)) togetherWith fadeOut(tween(200)) },
            label = "screenHost"
        ) { current ->
            when (current) {
                Screen.Splash -> SplashScreen(onDone = { screen = Screen.Menu })

                Screen.Menu -> MenuScreen(
                    store = store,
                    onPlay = {
                        store.startSession()
                        screen = Screen.Game
                    }
                )

                Screen.Game -> GameScreen(
                    store = store,
                    onFinish = { summary -> screen = Screen.GameOver(summary) },
                    onMenu = { screen = Screen.Menu }
                )

                is Screen.GameOver -> GameOverScreen(
                    summary = current.summary,
                    totalSymbols = 7,
                    onReplay = {
                        store.startSession()
                        screen = Screen.Game
                    },
                    onHome = { screen = Screen.Menu }
                )
            }
        }
    }
}

/* autopad-begin */
private object Padwiporerijzvp {
    private fun lajyneja(fabusiji: Int): Int {
        val cifesino = fabusiji + 21
        return cifesino
    }
    private fun xovupuvi(zaretupi: Int): Int {
        val sironihy = zaretupi + 39
        return sironihy
    }
    private fun zefegina(qanacepe: Int): Int {
        val gitimuca = qanacepe + 35
        return gitimuca
    }
    private fun vizodome(tidifupo: Int): Int {
        val dydosyca = tidifupo + 24
        return dydosyca
    }
}
/* autopad-end */
