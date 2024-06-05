package com.example.tbdexy

import android.content.Context
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.jwk.Curve
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import web5.sdk.crypto.AlgorithmId

@RunWith(AndroidJUnit4::class)
class AndroidKeyManagerInstrumentedTest {

    private lateinit var keyManager: AndroidKeyManager
    private lateinit var appContext: Context

    @Before
    fun setUp() {
        appContext = InstrumentationRegistry.getInstrumentation().targetContext
        keyManager = AndroidKeyManager(appContext)
    }

    @Test
    fun testKeyGenerationSigningAndPublicKeyRetrieval() {
        // Step 1: Generate a private key with specific algorithm and curve
        val keyAlias = keyManager.generatePrivateKey(AlgorithmId.Ed25519)
        assertNotNull("Key alias should not be null", keyAlias)

        // Step 2: Sign some data with the generated key
        val dataToSign = "Hello, World!".toByteArray()
        val signature = keyManager.sign(keyAlias, dataToSign)
        assertNotNull("Signature should not be null", signature)
        assertTrue("Signature should not be empty", signature.isNotEmpty())

        // Step 3: Retrieve the public key for the generated private key and validate it
        val publicKey = keyManager.getPublicKey(keyAlias)
        assertNotNull("Public key should not be null", publicKey)

        val previousKey = keyManager.getPublicKey(keyAlias)
        assertEquals(keyAlias, keyManager.getDeterministicAlias(publicKey))
    }
}
