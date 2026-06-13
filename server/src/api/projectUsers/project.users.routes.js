import { Router } from "express";
import * as projectUsersController from "#api/projectUsers/project.users.controller";

const router = Router();

router.get("/:projectUuid", projectUsersController.getProjectUsers);
router.post("/:projectUuid/invite-user", projectUsersController.inviteUser);
router.post("/accept-invite", projectUsersController.acceptProjectInvite);
router.post("/reject-invite", projectUsersController.rejectProjectInvite);

export default router;
