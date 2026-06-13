import { Router } from "express";
import * as projectRolesController from "#api/projectRoles/project.role.controller";

const router = Router();

router.post("/create", projectRolesController.createRole);
router.post("/edit", projectRolesController.editRole);
router.get("/:projectUuid/get-roles", projectRolesController.getRoles);

export default router;
