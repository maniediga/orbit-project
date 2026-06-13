import prisma from "#config/prisma.client";

export async function createProjectRole(roleName, projectUuid, writePermission, deletePermission) {
    return await prisma.projectRole.create({
        data: {
            projectUuid: projectUuid,
            name: roleName,
            writePermission,
            deletePermission,
        },
    });
}

export async function getProjectRoles(projectUuid) {
    return await prisma.projectRole.findMany({
        where: {
            projectUuid,
        },
        select: {
            name,
            writePermission,
            deletePermission,
            updatedAt,
        },
    });
}

export async function getProjectRoleByName(roleName, projectUuid) {
    return await prisma.$queryRaw`
        SELECT project_role_id as id, project_role_name as name, write_permission as writePermission, delete_permission as deletePermission, updated_at as updatedAt
        FROM project_roles
        WHERE project_role_name = ${roleName} AND project_uuid = ${projectUuid}
    `;
}

export async function editProjectRole(oldRoleId, projectUuid, newRoleName, writePermission, deletePermission) {
    return await prisma.projectRole.update({
        where: {
            id: oldRoleId,
            projectUuid,
        },
        data: {
            name: newRoleName,
            writePermission,
            deletePermission,
        },
    });
}

export async function deleteProjectRole(roleName, projectUuid) {
    return await prisma.projectRole.delete({
        where: {
            name: roleName,
            projectUuid,
        },
    });
}
