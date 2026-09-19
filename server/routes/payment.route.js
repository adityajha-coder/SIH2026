import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", ...paymentController.createOrder);
paymentRouter.post("/verify", ...paymentController.verify);
paymentRouter.get("/government", ...paymentController.listGovernmentPayments);
paymentRouter.get("/startup", ...paymentController.listStartupPayments);
paymentRouter.get("/:id", ...paymentController.getPayment);

export default paymentRouter;
