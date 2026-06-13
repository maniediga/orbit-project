import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { getProjectRoleByName } from "#services/project.role.services";
import * as projectUserServices from "#services/project.users.services";
import { getUserByEmail } from "#services/user.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";

export async function getProjectUsers(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    const projectUsers = await projectUserServices.getProjectUsers(projectUuid, userId);

    // there has to be atleast one user returned if user is a member of the project
    if (!projectUsers) throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "Access denied. You are not a member of this project.");

    for (let user of projectUsers) {
        user.user_id = sqids.encode([user.user_id]);
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { projectUsers }, "users retrieved successfully"),
    );
}

export async function inviteUser(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;
    const { userEmail, roleName } = req.body;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Project uuid not provided");

    const user = await projectUserServices.getProjectUser(projectUuid, userId, userId);
    if (!user) throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "Access denied, You are not a member of this project.");

    const invitedUser = await getUserByEmail(userEmail);
    if (!invitedUser) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "No user found with the provided email");
    }

    const [role] = await getProjectRoleByName(roleName, projectUuid);
    if (!role) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Role not found");
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 30);
    const inviteSuccess = await projectUserServices.createProjectInvite(invitedUser.id, userId, projectUuid, expiresAt, role.id);
    if (!inviteSuccess) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't create project invite");
    }

    res.status(HTTP_RESPONSE_CODE.CREATED).json(new ApiResponse(HTTP_RESPONSE_CODE.CREATED, {}, "Invite sent sucessfully"));
}

export async function acceptProjectInvite(req, res) {
    const userId = req.userId;
    const { inviteCode } = req.body;

    const invite = await projectUserServices.getProjectInviteDetails(inviteCode);
    if (!invite || invite.inviteeUserId !== userId) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid project invite code or code expired");
    }

    const userAdded = await projectUserServices.addUserToProject(inviteCode, userId, invite.projectUuid, invite.roleId);
    if (!userAdded) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't accept project invite, try again later.");
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS);
}

export async function rejectProjectInvite(req, res) {
    const userId = req.userId;
    const { inviteCode } = req.body;

    const invite = await projectUserServices.getProjectInviteDetails(inviteCode);
    if (!invite || invite.inviteeUserId !== userId) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid project invite code or code expired");
    }

    const inviteRejected = await projectUserServices.deleteProjectInvite(invite.inviteCode);
    if (!inviteRejected) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't reject project invite, try again later.");
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Project invite rejected"));
}
