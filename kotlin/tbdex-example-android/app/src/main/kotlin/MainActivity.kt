package com.example.tbdexy

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AlertDialog

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import tbdex.sdk.httpclient.TbdexHttpClient
import tbdex.sdk.protocol.models.*
import web5.sdk.credentials.VerifiableCredential
import web5.sdk.dids.methods.dht.DidDht

/**
 * Shows the basics of interacting with the tbdex SDK in an android app.
 */
class MainActivity : AppCompatActivity() {

    // when you start a pfi, put its URL here.
    // Android needs it to be https
    //  so cloudflared tunnel --url http://localhost:9000 can be used to give you a http URL
    private val pfiServer = "https://atlantic-outline-liverpool-collectible.trycloudflare.com"

    suspend fun fetchPfiDid(): String {
        return withContext(Dispatchers.IO) {
            val client = okhttp3.OkHttpClient()
            val request = okhttp3.Request.Builder()
                .url("$pfiServer/did")
                .build()
            val response = client.newCall(request).execute()
            response.body?.string() ?: ""
        }
    }

    suspend fun getVerifiableCredential(did: String?): String {
        return withContext(Dispatchers.IO) {
            val url = "$pfiServer/vc?name=Mic&country=Australia&did=${did}"
            val client = okhttp3.OkHttpClient()
            val request = okhttp3.Request.Builder()
                .url(url)
                .build()
            val response = client.newCall(request).execute()
            response.body?.string() ?: ""
        }
    }

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        /*
         * This is a JWT that represents a Verifiable Credential (VC) prepared earlier
         */
        val signedVcJwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpkaHQ6a2ZkdGJjbTl6Z29jZjVtYXRmOWZ4dG5uZmZoaHp4YzdtZ2J3cjRrM3gzcXppYXVjcHA0eSMwIn0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRW1wbG95bWVudENyZWRlbnRpYWwiXSwiaWQiOiJ1cm46dXVpZDo4ZmQ1MjAzMC0xY2FmLTQ5NzgtYTM1ZC1kNDE3ZWI4ZTAwYjIiLCJpc3N1ZXIiOiJkaWQ6ZGh0OmtmZHRiY205emdvY2Y1bWF0ZjlmeHRubmZmaGh6eGM3bWdid3I0azN4M3F6aWF1Y3BwNHkiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTEyLTIxVDE3OjAyOjAxWiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmRodDp5MzltNDhvem9ldGU3ejZmemFhbmdjb3M4N2ZodWgxZHppN2Y3andiamZ0N290c2toOXRvIiwicG9zaXRpb24iOiJTb2Z0d2FyZSBEZXZlbG9wZXIiLCJzdGFydERhdGUiOiIyMDIxLTA0LTAxVDEyOjM0OjU2WiIsImVtcGxveW1lbnRTdGF0dXMiOiJDb250cmFjdG9yIn0sImV4cGlyYXRpb25EYXRlIjoiMjAyMi0wOS0zMFQxMjozNDo1NloifSwiaXNzIjoiZGlkOmRodDprZmR0YmNtOXpnb2NmNW1hdGY5Znh0bm5mZmhoenhjN21nYndyNGszeDNxemlhdWNwcDR5Iiwic3ViIjoiZGlkOmRodDp5MzltNDhvem9ldGU3ejZmemFhbmdjb3M4N2ZodWgxZHppN2Y3andiamZ0N290c2toOXRvIn0.ntcgPOdXOatULWo-q6gkuhKmi5X3bzCONQY38t_rsC1hVhvvdAtmiz-ccoLIYUkjECRHIxO_UZbOKgn0EETBCA"
        val vc = VerifiableCredential.parseJwt(signedVcJwt)
        print(vc) // VerifiableCredential details
        print(vc.issuer) // VerifiableCredential issuer

        val vcTextView: TextView = findViewById(R.id.vcTextView)

        /*
         * Create a new did for this app, and store it in the AndroidKeyManager (encrypted prefs).
         * This should be done once, and the did should be stored for future use automatically.
         */
        val keyManager = AndroidKeyManager(applicationContext)
        val did = DidDht.create(keyManager)

        vcTextView.text = "this is my did: ${did.uri}"

        // Use Coroutine to perform network operation in the background as required by android
        CoroutineScope(Dispatchers.IO).launch {
            try {

                val pfiDid = fetchPfiDid()
                print(pfiDid)

                val signedVC = getVerifiableCredential(did.uri)
                print(signedVC)

                /*
                 * This will talk to a PFI (liquidity node) and get the offerings available. The DID that is provided is from the PFI server.
                 * This is a list of offerings which we can render later on. See the OffersAdapter class for how it shows some of the offering fields.
                 */
                val offering = TbdexHttpClient.getOfferings(pfiDid)

                // Update UI on the main thread
                withContext(Dispatchers.Main) {
                    val offersRecyclerView: RecyclerView = findViewById(R.id.offersRecyclerView)
                    val offersAdapter = OffersAdapter(offering)
                    offersRecyclerView.adapter = offersAdapter
                }


                /*
                 * Now lets do a exchange, in this case USD for AUD
                 */

                val cardNumber = "5520000000000000"
                val expiryMonth = "05"
                val expiryYear = "2024"
                val cvc = "123"
                val nameOnCard = "Roland Robot"
                val accountNumber = "987654321"
                val bsbNumber = "123456"
                val accountName = "Mr Roland Robot"
                val transferAmount = "42.42"


                val payinPaymentDetails = mapOf(
                    "cc_number" to cardNumber,
                    "expiry_month" to expiryMonth,
                    "expiry_year" to expiryYear,
                    "cvc" to cvc,
                    "name" to nameOnCard
                )

                val payoutPaymentDetails = mapOf(
                    "accountNumber" to accountNumber,
                    "bsbNumber" to bsbNumber,
                    "accountName" to accountName
                )

                print("offering:$offering")
                val rfqData = CreateRfqData(
                    offeringId = offering.first().metadata.id,
                    payin = CreateSelectedPayinMethod(kind = "CREDIT_CARD", amount = transferAmount, paymentDetails = payinPaymentDetails),
                    payout = CreateSelectedPayoutMethod(kind = "AUSTRALIAN_BANK_ACCOUNT", paymentDetails = payoutPaymentDetails),
                    claims = listOf(signedVC)
                )


                val rfq = Rfq.create(
                    to = pfiDid,
                    from = did.uri,
                    rfqData = rfqData
                )

                rfq.sign(did)
                TbdexHttpClient.createExchange(rfq, did.uri)
                println("Sent RFQ: ${rfq}")


                val exchanges = TbdexHttpClient.getExchanges(pfiDid, did)
                println("Exchanges: ${exchanges}")

                // fetch exchange by exchangeId
                val currentExchange = exchanges.find { it.first().metadata.exchangeId == rfq.metadata.exchangeId }
                println("Target Exchange: ${currentExchange}")

                // show the messages
                currentExchange?.forEach { println(it) }



                // find the message which has metadata.kind of "quote"
                val quote = currentExchange?.find { it.metadata.kind.name == "quote" }
                println("Quote: ${quote}")

                // now lets place an order for this quote:
                val order = Order.create(to=pfiDid, exchangeId = rfq.metadata.exchangeId, from=did.uri)
                order.sign(did)
                TbdexHttpClient.submitOrder(order)

                // ask user to continue somehow in android, wait for their input
                showAlertForUserInput("Soon the order should be put though, look at logcat to see results and should see Order and Order status and close.")


                // now reload exchanges, and see the order and result, if waited long enough
                // for the payment to be processed..
                val currentExchange2 = TbdexHttpClient.getExchanges(pfiDid, did).find { it.first().metadata.exchangeId == rfq.metadata.exchangeId }
                currentExchange2?.forEach { println(it) }




            } catch (e: Exception) {
                e.printStackTrace()

                withContext(Dispatchers.Main) {
                    vcTextView.text = vcTextView.text.toString() + "\n" + e.toString()
                }

            }
        }





    }

    fun showAlertForUserInput(msg: String) {
        // Use the main thread for UI operations
        runOnUiThread {
            AlertDialog.Builder(this).apply {
                setTitle("Confirmation")
                setMessage(msg)
                setPositiveButton("Yes") { dialog, which ->
                    // User clicked Yes, continue with your operation
                    // You might want to call a function here to continue your process
                }
                setNegativeButton("No") { dialog, which ->
                    // User clicked No, handle accordingly
                }
                setCancelable(false)  // This prevents the dialog from being dismissed by tapping outside.
                show()
            }
        }
    }

}

class OffersAdapter(private val offers: List<Offering>) : RecyclerView.Adapter<OffersAdapter.OfferViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OfferViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_offer, parent, false)
        return OfferViewHolder(view)
    }

    override fun onBindViewHolder(holder: OfferViewHolder, position: Int) {
        val offer = offers[position]
        holder.bind(offer)
    }

    override fun getItemCount(): Int = offers.size

    class OfferViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val descriptionTextView: TextView = itemView.findViewById(R.id.descriptionTextView)
        private val exchangeRateTextView: TextView = itemView.findViewById(R.id.exchangeRateTextView)
        private val currenciesTextView: TextView = itemView.findViewById(R.id.currenciesTextView)

        @SuppressLint("SetTextI18n")
        fun bind(offer: Offering) {
            descriptionTextView.text = offer.data.description
            exchangeRateTextView.text = "Exchange Rate: ${offer.data.payoutUnitsPerPayinUnit}"
            currenciesTextView.text = "Payout: ${offer.data.payout.currencyCode}, Payin: ${offer.data.payin.currencyCode}"
        }
    }
}

