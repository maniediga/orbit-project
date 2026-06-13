import prisma from "#config/prisma.client";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

export async function createProjectUserRelation(userId, projectUuid, roleId) {
    return await prisma.projectUser.create({
        data: {
            userId: userId,
            projectUuid: projectUuid,
            roleId: roleId,
        },
    });
}

export async function isUserMemberOfProject(projectUuid, userId) {
    return await prisma.projectUser.findFirst({
        where: {
            userId: userId,
            projectUuid: projectUuid,
        },
    });
}

export async function getProjectUsersByEmails(projectUuid, userEmails) {
    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, u.user_name as email
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        WHERE pu.project_uuid = ${projectUuid} AND u.user_name IN (${Prisma.join(userEmails, ",")})
    `;
}

export async function getProjectUser(projectUuid, requesterUserId, queriedUserId) {
    const userBelongsToProject = await isUserMemberOfProject(projectUuid, requesterUserId);

    if (!userBelongsToProject) return null;

    // Returns an array of users, but in this case we have only requested one user so we return the first element of the array.
    const user_array = await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, pr.project_role_name AS role 
        FROM project_users pu 
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_uuid = ${projectUuid} AND u.user_id = ${queriedUserId}
    `;

    return user_array[0];
}

export async function getProjectUsers(projectUuid, userId) {
    const userBelongsToProject = await isUserMemberOfProject(projectUuid, userId);

    if (!userBelongsToProject) return null;

    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, u.user_name as email, pr.project_role_name AS role 
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_uuid = ${projectUuid}
    `;
}

export async function createProjectInvite(inviteeId, inviterId, projectUuid, expiresAt, roleId) {
    const cuid = createId();
    return await prisma.$queryRaw`
        INSERT INTO project_invites (invite_code, invitee_user_id, inviter_user_id, expires_at, project_role_id, project_uuid) 
        VALUES (${cuid}, ${inviteeId}, ${inviterId}, ${expiresAt}, ${roleId}, ${projectUuid})
    `;
}

export async function deleteProjectInvite(inviteCode) {
    return await prisma.projectInvite.delete({
        where: {
            inviteCode,
        },
    });
}

export async function getProjectInviteDetails(inviteCode) {
    const curTime = new Date(Date.now());
    let result = await prisma.$queryRaw`
        SELECT project_uuid as projectUuid, invitee_user_id as inviteeUserId, project_role_id as roleId
        FROM project_invites
        WHERE invite_code = ${inviteCode} AND expires_at > ${curTime}
    `;
    if (result.length == 0) return null;
    result = result[0];
    return { projectUuid: result.projectuuid, inviteeUserId: result.inviteeuserid, roleId: result.roleid };
}

export async function addUserToProject(inviteCode, userId, projectUuid, roleId) {
    return prisma.$transaction([
        prisma.projectUser.create({ data: { userId, projectUuid, roleId } }),
        prisma.$queryRaw`DELETE FROM project_invites WHERE invite_code = ${inviteCode}`,
    ]);
}

export async function getProjectUserRole(userId, projectUuid) {
    return await prisma.$queryRaw`
        SELECT r.project_role_name as name, r.write_permission as writePermission, r.delete_permission as deletePermission
        FROM project_users pu
        JOIN project_roles r USING (project_role_id)
        WHERE pu.user_id = ${userId} AND pu.project_uuid = ${projectUuid}
    `;
}

export async function changeProjectUserRole(userId, projectUuid, roleId) {
    return await prisma.projectUser.update({
        where: {
            userId,
            projectUuid,
        },
        data: {
            roleId,
        },
    });
}
