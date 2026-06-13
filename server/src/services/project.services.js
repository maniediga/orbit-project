import { createId } from "@paralleldrive/cuid2";
import prisma from "#config/prisma.client";
import { ApiError } from "#utils/api.error";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";

export async function getAllNotDeletedProjectCategoriesAndFeatures(projectUuid, userId) {
    return await prisma.project.findUnique({
        where: {
            uuid: projectUuid,
            projectUsers: {
                some: {
                    userId: userId,
                },
            },
        },
        select: {
            uuid: true,
            name: true,
            projectRoles: {
                select: {
                    name: true,
                    writePermission: true,
                    deletePermission: true,
                },
            },
            users: {
                select: {
                    displayName: true,
                    name: true,
                    id: true,
                },
            },
            isDeleted: false,
            categories: {
                select: {
                    uuid: true,
                    name: true,
                    color: true,
                    parentUuid: true,
                    isDeleted: false,
                    features: {
                        select: {
                            uuid: true,
                            name: true,
                            parentUuid: true,
                            categoryUuid: true,
                            isDeleted: false,
                            details: {
                                select: {
                                    status: true,
                                    dueDate: true,
                                    assigneeId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}

export async function getProjectDetails(projectUuid) {
    return await prisma.project.findFirst({
        where: {
            uuid: projectUuid,
        },
    });
}

export async function getUserProjectRole(userId, projectUuid) {
    const record = await prisma.projectUser.findUnique({
        where: {
            userId_projectUuid: {
                userId: userId,
                projectUuid: projectUuid,
            },
        },
        include: {
            projectRoles: true,
        },
    });

    return record?.projectRoles;
}

export async function softDeleteUserProject(userId, projectUuid) {
    const role = await getUserProjectRole(userId, projectUuid);

    if (!role || !role.deletePermission) {
        throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "Unauthorized: You do not have permission to delete this project");
    }

    const time = new Date();

    await prisma.$queryRaw`
        UPDATE projects
        SET is_deleted = true, deleted_at = ${time}
        WHERE project_uuid = ${projectUuid}
    `;
}

export async function reverseSoftDeleteUserProject(userId, projectUuid) {
    const role = await getUserProjectRole(userId, projectUuid);

    if (!role || !role.deletePermission) {
        throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "Unauthorized: You do not have permission to restore this project");
    }

    await prisma.$queryRaw`
        UPDATE projects
        SET is_deleted = false, deleted_at = null
        WHERE project_uuid = ${projectUuid}
    `;
}

export async function checkProjectExistsForUser(projectName, userId) {
    const existingProject = await prisma.project.findFirst({
        where: {
            // match projects with given name
            name: projectName,
            // if any project is related to the given userId then match it.
            projectUsers: {
                some: {
                    userId: userId,
                },
            },
        },
    });

    // first ! converts object to boolean and negates it, second ! negates it to get correct truthy / falsy value.
    return !!existingProject;
}

// creates a project, creates a manager role for the project, assigns the manager role to the creater
export async function createProjectForUser(createrUserId, projectName, projectDescription) {
    // start an interactive transaction by passing a function to $transaction
    return await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                uuid: createId(),
                name: projectName,
                description: projectDescription,
            },
        });

        const managerRole = await tx.projectRole.create({
            data: {
                name: "Manager",
                projectUuid: project.uuid, // use the uuid from the project created by above query
                deletePermission: true,
                writePermission: true,
            },
        });

        await tx.projectUser.create({
            data: {
                userId: createrUserId,
                projectUuid: project.uuid,
                roleId: managerRole.id, // assign manager role to the creator of the project
            },
        });

        // add the role field to the response
        project.role = managerRole.name;

        return project;
    });
}

export async function getProjectsByUserId(userId) {
    // get all projects and project roles related to the projectUsers table where userId is equal to the user id provided
    const memberships = await prisma.projectUser.findMany({
        where: {
            userId: userId,
        },
        include: {
            project: true, // Include the full project object
            projectRoles: true, // Include the full role object
        },
    });

    // example output
    // [
    //   { userId: 1, projectId: 101, roleId: 1, project: { ... }, projectRoles: { name: 'Manager', ... } },
    //   { userId: 1, projectId: 102, roleId: 5, project: { ... }, projectRoles: { name: 'Member', ... } }
    // ]

    const projectsWithRoles = memberships.map((membership) => ({
        // Spread all the project details (id, name, description, etc.)
        ...membership.project,
        // Add a 'role' property with the role name
        role: membership.projectRoles.name,
    }));

    return projectsWithRoles;
}

export async function getAllSoftDeletedProjectNodes(projectUuid, userId) {
    return await prisma.$transaction(async (tx) => {
        const softDeletedCategories = await tx.category.findMany({
            where: {
                parentUuid: projectUuid,
                isDeleted: true,
                // atleast one userId's of the projectUsers match the userId of the user requesting the data
                project: {
                    projectUsers: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            },
        });

        const softDeletedFeatures = await tx.feature.findMany({
            where: {
                category: {
                    projectUuid: projectUuid,
                    // atleast one userId's of the projectUsers match the userId of the user requesting the data
                    project: {
                        projectUsers: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                },
                isDeleted: true,
            },
        });

        return { softDeletedCategories, softDeletedFeatures };
    });
}
