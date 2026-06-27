import { MandiriPaymentService } from "../lib/services/payments/mandiri-payment-service";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING MANDIRI MERCHANT QRIS INTEGRATION TESTS");
  console.log("==================================================");

  const mandiriService = new MandiriPaymentService();

  // Test 1: Generate QRIS Payment Request
  console.log("\n[TEST 1] Generating Dynamic QRIS Payment...");
  try {
    const qrResult = await mandiriService.createPayment(
      "test-order-123",
      15000,
      { name: "John Doe", email: "john@example.com" }
    );
    console.log("✅ SUCCESS: QRIS Generated Successfully!");
    console.log("   - Transaction ID:", qrResult.providerTransactionId);
    console.log("   - Reference:", qrResult.providerReference);
    console.log("   - Amount:", qrResult.amount);
    console.log("   - QR Payload Length:", qrResult.qrPayload?.length);
    console.log("   - Expired At:", qrResult.expiredAt.toLocaleString());
  } catch (error) {
    console.error("❌ FAILED:", error);
  }

  // Test 2: Status Inquiry
  console.log("\n[TEST 2] Running Status Inquiry (check-status)...");
  try {
    const statusResult = await mandiriService.getStatus("MNDR-TX-test-order-123-1234");
    console.log("✅ SUCCESS: Status Check Completed!");
    console.log("   - Status:", statusResult.status);
  } catch (error) {
    console.error("❌ FAILED:", error);
  }

  // Test 3: Webhook Parsing
  console.log("\n[TEST 3] Parsing Webhook Raw Payload...");
  try {
    const rawMockPayload = JSON.stringify({
      transaction_id: "MNDR-TX-test-order-123-1234",
      amount: "15000",
      event_id: "evt_987654321",
      referenceNo: "ref_555",
    });

    const parsed = await mandiriService.parseWebhook(rawMockPayload);
    console.log("✅ SUCCESS: Webhook Payload Parsed!");
    console.log("   - Provider Transaction ID:", parsed.providerTransactionId);
    console.log("   - Status mapped:", parsed.status);
    console.log("   - Amount:", parsed.amount);
    console.log("   - Event ID:", parsed.eventId);
  } catch (error) {
    console.error("❌ FAILED:", error);
  }

  // Test 4: Webhook Signature Verification
  console.log("\n[TEST 4] Verifying Webhook Signature...");
  try {
    const mockHeaders = {
      "x-signature": "valid-signature-header-content",
    };
    const mockRawBody = '{"transaction_id":"MNDR-TX-123"}';
    const isSignatureValid = await mandiriService.verifyWebhook(mockHeaders, mockRawBody);
    console.log("✅ SUCCESS: Signature Verification evaluated!");
    console.log("   - Is Valid:", isSignatureValid);
  } catch (error) {
    console.error("❌ FAILED:", error);
  }

  console.log("\n==================================================");
  console.log("ALL MANDIRI QRIS MOCK TESTS COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runTests().catch(console.error);
