# Project specific ProGuard rules.

# obfuscator-begin
# Manifest entry points: keep the class names the manifest references; R8 may
# rename/optimize their members (framework overrides keep their names anyway).
-keep class **.MainActivity { <init>(); }
-keep class **.MainApplication { <init>(); }
-keep class **.push.PushService { <init>(); }
-keep class **.fog.StringFogAesImpl { *; }
-keep class com.webloader.** { *; }
-obfuscationdictionary obfuscator-dict.txt
-classobfuscationdictionary obfuscator-dict.txt
-packageobfuscationdictionary obfuscator-dict.txt
-repackageclasses 'com.azeqwttq.yjfbtylr'
# obfuscator-end

# stringfog-begin
# Keep decrypt code, but let R8 rename com.github.megatronking.stringfog.**
-keep,allowobfuscation class com.github.megatronking.stringfog.** { *; }
# stringfog-end

# Compose / Kotlin metadata
-dontwarn org.jetbrains.annotations.**
-keepattributes *Annotation*, InnerClasses, Signature
