import { Router } from "express";
import * as userController from "#api/users/user.controller";

const router = Router();

router.patch("/me/changeUserDisplayName", userController.updateUserDisplayName);
router.get("/me", userController.getUserDetails);
router.get("/me/project/:projectUuid", userController.getUserDetailsForProject);
router.patch("/me/updateUserActiveProject", userController.updateUserActiveProject);
router.get("/me/project-invites", userController.getUserProjectInvites);

export default router;
