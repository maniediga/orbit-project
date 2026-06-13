import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as projectRoleServices from "#services/project.role.services";
import { getProjectUserRole } from "#services/project.users.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";

export async function createRole(req, res) {
    const userId = req.userId;
    const { roleName, projectUuid, writePermission, deletePermission } = req.body;

    if (!roleName || !projectUuid) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "The fields roleName, projectUuid are required");
    }

    const [userRole] = await getProjectUserRole(userId, projectUuid);
    if (userRole.name != "Manager") {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "You don't have the permission to create a role");
    }

    const [roleExists] = await projectRoleServices.getProjectRoleByName(roleName, projectUuid);
    if (roleExists) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Role already exists");
    }

    const role = await projectRoleServices.createProjectRole(roleName, projectUuid, writePermission, deletePermission);
    if (!role) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't create project role");
    }

    res.status(HTTP_RESPONSE_CODE.CREATED).json(new ApiResponse(HTTP_RESPONSE_CODE.CREATED, {}, "Role created"));
}

export async function editRole(req, res) {
    const userId = req.userId;
    const { oldRoleName, projectUuid, newRoleName, writePermission, deletePermission } = req.body;

    if (!oldRoleName || !projectUuid) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Missing role name");
    }

    const [userRole] = await getProjectUserRole(userId, projectUuid);
    if (userRole.name != "Manager") {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "You don't have the permission to edit a role");
    }

    const [oldRole] = await projectRoleServices.getProjectRoleByName(oldRoleName, projectUuid);
    if (!oldRole) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "The role to be edited doesn't exist");
    }

    const role = await projectRoleServices.editProjectRole(
        oldRole.id,
        projectUuid,
        newRoleName,
        writePermission,
        deletePermission,
    );
    if (!role) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't edit project role");
    }

    res.status(HTTP_RESPONSE_CODE.CREATED).json(new ApiResponse(HTTP_RESPONSE_CODE.CREATED, {}, "Role updated"));
}

export async function getRoles(req, res) {
    const { projectUuid } = req.params;
    const roles = await projectRoleServices.getProjectRoles(projectUuid);
    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, roles));
}
