// Digilocker documetns verification adapter
export const digilockerService = {

    verifyDocumentUri(uri) {
        if (!uri || typeof uri !== "string") {
            return { valid: false, reason: "DigiLocker URI required" };
        }

        const uriPattern = /^in\.gov\.[a-z0-9_-]+:[a-z0-9_-]+-[a-z0-9_-]+$/i;
        const isValid = uriPattern.test(uri.trim());

        if (!isValid) {
            return {
                valid: false,
                reason: "Invalid DigiLocker URI syntax. Example: in.gov.dpiit:cert-DIPP84920",
            };
        }

        const [issuerPart, docPart] = uri.split(":");
        const issuer = issuerPart.replace("in.gov.", "");
        const [docType, docId] = docPart.split("-");

        return {
            valid: true,
            issuer,
            docType,
            docId,
            verifiedAt: new Date().toISOString(),
            status: "VERIFIED",
        };
    },
};
