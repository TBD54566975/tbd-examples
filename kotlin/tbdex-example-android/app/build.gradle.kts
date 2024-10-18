plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.tbdexy"
    compileSdk = 34
    packagingOptions {
        resources {
            excludes += setOf("META-INF/DEPENDENCIES")
        }
    }

    defaultConfig {
        applicationId = "com.example.tbdexy"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    /** required to make tbdex and key management work */
    implementation("androidx.security:security-crypto:1.0.0")
    implementation("xyz.block:tbdex-httpclient:2.0.1") {
        exclude(group = "com.google.protobuf", module = "protobuf-java")
        exclude(group = "org.bouncycastle", module = "bcprov-jdk18on")
        exclude(group = "com.github.stephenc.jcip", module = "jcip-annotations")
        exclude(group = "com.google.crypto.tink", module="tink")
    }

    implementation("xyz.block:tbdex-protocol:2.0.1") {
        exclude(group = "com.google.protobuf", module = "protobuf-java")
        exclude(group = "org.bouncycastle", module = "bcprov-jdk18on")
        exclude(group = "com.github.stephenc.jcip", module = "jcip-annotations")
        exclude(group = "com.google.crypto.tink", module="tink")
    }





    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}