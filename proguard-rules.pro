# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/google/home/sdk/android-sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools-proguard.html

# Add any project specific keep rules here:

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
