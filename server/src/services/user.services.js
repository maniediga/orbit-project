import prisma from "#config/prisma.client";
import { Prisma } from "@prisma/client";

export async function updateUserActiveProject(userId, projectUuid) {
    return await prisma.$transaction(async (tx) => {
        // check if user is part of the project
        // no need to check is project is being set as inactive., therefore null
        if (projectUuid) {
            const userProject = await tx.project.findUnique({
                where: {
                    uuid: projectUuid,
                    projectUsers: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            });

            // return null to signify failure to update as user isn't part of the project
            if (!userProject) null;
        }

        const user = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                activeProjectUuid: projectUuid,
            },
        });

        return user;
    });
}

export async function updateUserDisplayName(userId, newDisplayName) {
    return await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            displayName: newDisplayName,
        },
    });
}

export async function getUserByEmail(email) {
    return await prisma.user.findFirst({
        where: {
            name: email,
        },
    });
}

export async function getUserById(userId) {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}

export async function getUserDetailsForProject(userId, projectUuid) {
    return await prisma.$queryRaw`
        SELECT u.user_name as email, u.display_name as displayName, r.project_role_name as role
        FROM users u
        JOIN project_users pu USING (user_id)
        JOIN project_roles r USING (project_role_id)
        WHERE u.user_id = ${userId} AND pu.project_uuid = ${projectUuid}
    `;
}

export async function getUserVerificationStatus(userId) {
    // return verification status
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}

export async function getUserProjectInvites(userId) {
    const curTime = new Date(Date.now());
    return await prisma.$queryRaw`
        SELECT invite_code as inviteCode, inviter.user_name as inviterEmail, p.project_name as projectName
        FROM project_invites 
        JOIN users inviter ON inviter.user_id = project_invites.inviter_user_id
        JOIN projects p USING (project_uuid)
        WHERE invitee_user_id = ${userId} AND expires_at > ${curTime}
    `;
}
