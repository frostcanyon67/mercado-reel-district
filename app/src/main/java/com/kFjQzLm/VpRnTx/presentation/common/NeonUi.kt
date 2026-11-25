package com.kFjQzLm.VpRnTx.presentation.common

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kFjQzLm.VpRnTx.core.theme.Accent
import com.kFjQzLm.VpRnTx.core.theme.AccentCool
import com.kFjQzLm.VpRnTx.core.theme.AccentDeep
import com.kFjQzLm.VpRnTx.core.theme.AccentWarm
import com.kFjQzLm.VpRnTx.core.theme.AccentWarmLight
import com.kFjQzLm.VpRnTx.core.theme.BgBase
import com.kFjQzLm.VpRnTx.core.theme.Glass
import com.kFjQzLm.VpRnTx.core.theme.GoldHair
import com.kFjQzLm.VpRnTx.core.theme.Hairline
import com.kFjQzLm.VpRnTx.core.theme.Ink
import com.kFjQzLm.VpRnTx.core.theme.SurfaceSheet
import com.kFjQzLm.VpRnTx.core.theme.TextMuted
import com.kFjQzLm.VpRnTx.core.theme.TextPrimary
import com.kFjQzLm.VpRnTx.core.theme.TextSecondary

enum class PalaceIcon { NONE, PLAY, BACK, SPIN, CLOSE, GIFT, CARDS, GEAR, COIN, TROPHY, LOCK, CHECK, HOME, CROWN }

@Composable
fun PalaceIconDraw(icon: PalaceIcon, color: Color, size: Dp = 22.dp) {
    if (icon == PalaceIcon.NONE) return
    Canvas(modifier = Modifier.size(size)) {
        val w = this.size.width
        val h = this.size.height
        val stroke = Stroke(width = w * 0.09f, cap = StrokeCap.Round, join = StrokeJoin.Round)
        fun line(x1: Float, y1: Float, x2: Float, y2: Float) =
            drawLine(color, Offset(x1 * w, y1 * h), Offset(x2 * w, y2 * h), stroke.width, StrokeCap.Round)

        when (icon) {
            PalaceIcon.PLAY -> {
                val p = Path().apply {
                    moveTo(0.32f * w, 0.16f * h)
                    lineTo(0.32f * w, 0.84f * h)
                    lineTo(0.82f * w, 0.50f * h)
                    close()
                }
                drawPath(p, color)
            }
            PalaceIcon.BACK -> {
                line(0.66f, 0.18f, 0.32f, 0.50f)
                line(0.32f, 0.50f, 0.66f, 0.82f)
            }
            PalaceIcon.SPIN -> {
                drawArc(
                    color, -50f, 285f, false,
                    topLeft = Offset(w * 0.16f, h * 0.16f),
                    size = Size(w * 0.68f, h * 0.68f),
                    style = Stroke(w * 0.10f, cap = StrokeCap.Round)
                )
                line(0.74f, 0.14f, 0.86f, 0.28f)
                line(0.74f, 0.14f, 0.60f, 0.26f)
            }
            PalaceIcon.CLOSE -> {
                line(0.24f, 0.24f, 0.76f, 0.76f)
                line(0.76f, 0.24f, 0.24f, 0.76f)
            }
            PalaceIcon.COIN -> {
                drawCircle(color, w * 0.34f, Offset(w / 2, h / 2), style = Stroke(w * 0.10f))
                drawCircle(color, w * 0.12f, Offset(w / 2, h / 2))
            }
            PalaceIcon.TROPHY -> {
                drawRoundRect(
                    color, Offset(0.30f * w, 0.16f * h), Size(0.40f * w, 0.42f * h),
                    CornerRadius(w * 0.10f), style = Stroke(w * 0.09f)
                )
                line(0.24f, 0.24f, 0.16f, 0.34f)
                line(0.16f, 0.34f, 0.24f, 0.46f)
                line(0.76f, 0.24f, 0.84f, 0.34f)
                line(0.84f, 0.34f, 0.76f, 0.46f)
                line(0.50f, 0.58f, 0.50f, 0.74f)
                line(0.34f, 0.84f, 0.66f, 0.84f)
            }
            PalaceIcon.LOCK -> {
                drawRoundRect(
                    color, Offset(0.24f * w, 0.44f * h), Size(0.52f * w, 0.40f * h),
                    CornerRadius(w * 0.07f), style = Stroke(w * 0.09f)
                )
                drawArc(
                    color, 180f, 180f, false,
                    topLeft = Offset(0.32f * w, 0.18f * h), size = Size(0.36f * w, 0.44f * h),
                    style = Stroke(w * 0.09f, cap = StrokeCap.Round)
                )
            }
            PalaceIcon.CHECK -> {
                line(0.22f, 0.52f, 0.42f, 0.72f)
                line(0.42f, 0.72f, 0.80f, 0.28f)
            }
            PalaceIcon.HOME -> {
                val p = Path().apply {
                    moveTo(0.14f * w, 0.48f * h)
                    lineTo(0.50f * w, 0.16f * h)
                    lineTo(0.86f * w, 0.48f * h)
                    moveTo(0.24f * w, 0.44f * h)
                    lineTo(0.24f * w, 0.84f * h)
                    lineTo(0.76f * w, 0.84f * h)
                    lineTo(0.76f * w, 0.44f * h)
                }
                drawPath(p, color, style = stroke)
            }
            PalaceIcon.CROWN -> {
                val p = Path().apply {
                    moveTo(0.14f * w, 0.72f * h)
                    lineTo(0.20f * w, 0.30f * h)
                    lineTo(0.38f * w, 0.52f * h)
                    lineTo(0.50f * w, 0.22f * h)
                    lineTo(0.62f * w, 0.52f * h)
                    lineTo(0.80f * w, 0.30f * h)
                    lineTo(0.86f * w, 0.72f * h)
                    close()
                }
                drawPath(p, color)
            }
            PalaceIcon.GIFT -> {
                drawRoundRect(
                    color, Offset(0.18f * w, 0.40f * h), Size(0.64f * w, 0.44f * h),
                    CornerRadius(w * 0.05f), style = Stroke(w * 0.08f)
                )
                line(0.50f, 0.40f, 0.50f, 0.84f)
                line(0.18f, 0.56f, 0.82f, 0.56f)
            }
            PalaceIcon.CARDS -> {
                drawRoundRect(
                    color, Offset(0.30f * w, 0.20f * h), Size(0.44f * w, 0.60f * h),
                    CornerRadius(w * 0.06f), style = Stroke(w * 0.08f)
                )
                drawRoundRect(
                    color, Offset(0.16f * w, 0.30f * h), Size(0.44f * w, 0.60f * h),
                    CornerRadius(w * 0.06f), style = Stroke(w * 0.08f)
                )
            }
            PalaceIcon.GEAR -> {
                drawCircle(color, w * 0.20f, Offset(w / 2, h / 2), style = Stroke(w * 0.10f))
                for (i in 0 until 8) {
                    val a = i * Math.PI / 4
                    val r1 = w * 0.30f
                    val r2 = w * 0.42f
                    drawLine(
                        color,
                        Offset(w / 2 + (r1 * kotlin.math.cos(a)).toFloat(), h / 2 + (r1 * kotlin.math.sin(a)).toFloat()),
                        Offset(w / 2 + (r2 * kotlin.math.cos(a)).toFloat(), h / 2 + (r2 * kotlin.math.sin(a)).toFloat()),
                        stroke.width, StrokeCap.Round
                    )
                }
            }
            else -> Unit
        }
    }
}

@Composable
fun NeonPressable(
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    pressedScale: Float = 0.96f,
    onClick: () -> Unit,
    content: @Composable () -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(
        if (pressed && enabled) pressedScale else 1f,
        spring(dampingRatio = 0.55f, stiffness = Spring.StiffnessMediumLow),
        label = "pressScale"
    )
    Box(
        modifier = modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .clickable(interactionSource = interaction, indication = null, enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center
    ) { content() }
}

enum class PalaceButton { PRIMARY, SPIN, SECONDARY, GHOST, DANGER }

@Composable
fun PalaceButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: PalaceButton = PalaceButton.PRIMARY,
    height: Dp = when (variant) {
        PalaceButton.SPIN -> 64.dp
        PalaceButton.PRIMARY -> 62.dp
        PalaceButton.DANGER -> 56.dp
        else -> 48.dp
    },
    icon: PalaceIcon = PalaceIcon.NONE,
    enabled: Boolean = true
) {
    val shape = RoundedCornerShape(if (height >= 56.dp) 18.dp else 14.dp)
    val labelColor = when {
        !enabled -> TextMuted
        variant == PalaceButton.SPIN -> Ink
        variant == PalaceButton.DANGER -> com.kFjQzLm.VpRnTx.core.theme.Danger
        variant == PalaceButton.SECONDARY || variant == PalaceButton.GHOST -> TextPrimary
        else -> TextPrimary
    }
    val gradient = when {
        !enabled -> null
        variant == PalaceButton.PRIMARY -> Brush.linearGradient(listOf(Accent, AccentDeep, AccentWarm))
        variant == PalaceButton.SPIN -> Brush.linearGradient(listOf(AccentWarm, AccentWarmLight, Accent))
        else -> null
    }
    val flat = when {
        !enabled -> Color(0x0FFFF7ED)
        variant == PalaceButton.SECONDARY -> Glass
        else -> Color.Transparent
    }
    val border = when {
        !enabled -> Hairline
        variant == PalaceButton.SECONDARY -> GoldHair
        variant == PalaceButton.GHOST -> Hairline
        variant == PalaceButton.DANGER -> com.kFjQzLm.VpRnTx.core.theme.Danger.copy(alpha = 0.4f)
        else -> Color(0x33FFF7ED)
    }

    NeonPressable(modifier = modifier.height(height), enabled = enabled, onClick = onClick) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .clip(shape)
                .background(gradient ?: Brush.linearGradient(listOf(flat, flat)))
                .border(1.dp, border, shape),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (icon != PalaceIcon.NONE) {
                PalaceIconDraw(icon, labelColor, 24.dp)
                Spacer(Modifier.width(10.dp))
            }
            Text(
                text = label,
                color = labelColor,
                fontSize = if (height >= 56.dp) 19.sp else 12.sp,
                fontWeight = if (height >= 56.dp) FontWeight.Black else FontWeight.Bold,
                letterSpacing = if (height >= 56.dp) 2.5.sp else 1.2.sp,
                maxLines = 1
            )
        }
    }
}

@Composable
fun PalaceIconButton(icon: PalaceIcon, onClick: () -> Unit, modifier: Modifier = Modifier) {
    NeonPressable(modifier = modifier.size(44.dp), pressedScale = 0.9f, onClick = onClick) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(12.dp))
                .background(Glass)
                .border(1.dp, Hairline, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) { PalaceIconDraw(icon, TextPrimary, 20.dp) }
    }
}

@Composable
fun CoinPill(amount: Int, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .height(36.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0x6B000000))
            .border(1.dp, GoldHair, RoundedCornerShape(18.dp))
            .padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        PalaceIconDraw(PalaceIcon.COIN, AccentWarm, 16.dp)
        Spacer(Modifier.width(8.dp))
        Text(
            text = formatPalaceCoins(amount),
            color = TextPrimary,
            fontSize = 15.sp,
            fontWeight = FontWeight.ExtraBold
        )
    }
}

fun formatPalaceCoins(n: Int): String {
    val safe = if (n > 0) n else 0
    return safe.toString().reversed().chunked(3).joinToString(",").reversed()
}

@Composable
fun PalaceHeader(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    subtitleColor: Color = AccentWarm,
    framed: Boolean = true,
    left: @Composable () -> Unit = {},
    right: @Composable () -> Unit = {}
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height((44 + 72).dp)
                .padding(top = 44.dp, start = 12.dp, end = 12.dp)
                .background(if (framed) Color(0x57000000) else Color.Transparent),
            contentAlignment = Alignment.Center
        ) {
            Row(modifier = Modifier.fillMaxSize(), verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.width(96.dp), contentAlignment = Alignment.CenterStart) { left() }
                Column(
                    modifier = Modifier.weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = title,
                        color = if (framed) AccentWarm else TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 2.5.sp,
                        maxLines = 1
                    )
                    if (subtitle != null) {
                        Box(
                            modifier = Modifier
                                .padding(top = 6.dp)
                                .width(56.dp)
                                .height(1.dp)
                                .background(subtitleColor.copy(alpha = 0.35f))
                        )
                        Text(
                            text = subtitle,
                            color = subtitleColor,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 2.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
                Box(modifier = Modifier.width(132.dp), contentAlignment = Alignment.CenterEnd) { right() }
            }
        }
        if (framed) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(AccentWarm.copy(alpha = 0.22f))
            )
        }
    }
}

@Composable
fun PalaceStatCard(value: String, label: String, valueColor: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .height(64.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Glass)
            .border(1.dp, valueColor.copy(alpha = 0.28f), RoundedCornerShape(14.dp)),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(value, color = valueColor, fontSize = 18.sp, fontWeight = FontWeight.Black, maxLines = 1)
        Text(label, color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
    }
}

@Composable
fun PalaceBackdrop(
    imageRes: Int,
    overlay: List<Color>,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(modifier = modifier.fillMaxSize().background(BgBase)) {
        Image(
            painter = painterResource(imageRes),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(overlay)))
        content()
    }
}

@Composable
fun PalacePanel(
    title: String,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize().background(Color(0xDB0A040E)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = modifier
                .padding(24.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(SurfaceSheet)
                .border(1.dp, GoldHair, RoundedCornerShape(24.dp))
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                color = AccentWarm,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 2.sp
            )
            Spacer(Modifier.height(16.dp))
            content()
            Spacer(Modifier.height(18.dp))
            PalaceButton(
                label = "CLOSE",
                onClick = onClose,
                modifier = Modifier.fillMaxWidth(),
                variant = PalaceButton.SECONDARY
            )
        }
    }
}

@Composable
fun PalaceToggleRow(label: String, value: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        NeonPressable(
            modifier = Modifier.width(64.dp).height(30.dp),
            pressedScale = 0.95f,
            onClick = { onChange(!value) }
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(15.dp))
                    .background(if (value) AccentWarm.copy(alpha = 0.25f) else Color(0x0FFFF7ED))
                    .border(1.dp, if (value) AccentWarm else Hairline, RoundedCornerShape(15.dp)),
                contentAlignment = if (value) Alignment.CenterEnd else Alignment.CenterStart
            ) {
                Box(
                    modifier = Modifier
                        .padding(horizontal = 5.dp)
                        .size(20.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (value) AccentWarm else TextMuted)
                )
            }
        }
    }
    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Hairline))
}

@Composable
fun PalaceProgress(fraction: Float, color: Color, modifier: Modifier = Modifier, height: Dp = 6.dp) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height)
            .clip(RoundedCornerShape(height / 2))
            .background(Color(0x1AFFF7ED))
    ) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(fraction.coerceIn(0f, 1f))
                .background(color, RoundedCornerShape(height / 2))
        )
    }
}

/* autopad-begin */
private object Padcawehudy6m19 {
    private fun qyquhise(vyfoqoka: Int): Int {
        val xydyxupa = vyfoqoka + 58
        return xydyxupa
    }
    private fun lywexaro(zytejobe: Int): Int {
        val quseqovu = zytejobe + 36
        return quseqovu
    }
    private fun dexufiwe(fovanoly: Int): Int {
        val qixijisu = fovanoly + 55
        return qixijisu
    }
    private fun lurelaxo(seqaququ: Int): Int {
        val cypohypy = seqaququ + 90
        return cypohypy
    }
}
/* autopad-end */
