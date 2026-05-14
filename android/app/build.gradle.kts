plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
}

android {
    namespace = "com.hastashilpa.app"
    compileSdk = rootProject.extra["compileSdkVersion"] as Int

    defaultConfig {
        applicationId = "com.hastashilpa.app"
        minSdk = rootProject.extra["minSdkVersion"] as Int
        targetSdk = rootProject.extra["targetSdkVersion"] as Int
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern = "!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }
}

repositories {
    flatDir {
        dirs("../capacitor-cordova-android-plugins/src/main/libs", "libs")
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.coordinatorlayout:coordinatorlayout:1.3.0")
    implementation("androidx.core:core-splashscreen:1.2.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.recyclerview:recyclerview:1.3.1")
    implementation("com.google.android.material:material:1.9.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-fragment-ktx:2.7.2")
    implementation("androidx.navigation:navigation-ui-ktx:2.7.2")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.10")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    
    // Google AI (Gemini)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // Room Database
    implementation("androidx.room:room-runtime:2.5.2")
    kapt("androidx.room:room-compiler:2.5.2")
    implementation("androidx.room:room-ktx:2.5.2")

    implementation(project(":capacitor-android"))
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.7.0")
    implementation(project(":capacitor-cordova-android-plugins"))
}

apply(from = "capacitor.build.gradle")

try {
    val servicesJSON = file("google-services.json")
    if (servicesJSON.exists() && servicesJSON.length() > 0) {
        apply(plugin = "com.google.gms.google-services")
    }
} catch (e: Exception) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
