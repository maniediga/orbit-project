import apiClient from "#config/api";

export async function getUserProjectInvites() {
    try {
        const response = await apiClient.get("/user/me/project-invites");
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch invites";
    }
}

export async function getUserDetailsForProject(projectUuid) {
    try {
        const response = await apiClient.get(`/user/me/project/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch user data";
    }
}

export async function inviteUser(projectUuid, email, roleName) {
    try {
        const response = await apiClient.post(`/projectUsers/${projectUuid}/invite-user`, {
            userEmail: email,
            roleName,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "couldn't invite users";
    }
}

export async function acceptProjectInvite(inviteCode) {
    try {
        const response = await apiClient.post(`/projectUsers/accept-invite`, {
            inviteCode,
        });
        return response.data;
    } catch (err) {
        console.log(err);
        return err.response.data || "Couldn't accept project invite";
    }
}

export async function rejectProjectInvite(inviteCode) {
    try {
        const response = await apiClient.post(`/projectUsers/reject-invite`, {
            inviteCode,
        });
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't reject project invite";
    }
}

export async function createProjectRole(projectUuid, roleName, writePermission, deletePermission) {
    try {
        const response = await apiClient.post("/projectRole/create", {
            projectUuid,
            roleName,
            writePermission,
            deletePermission,
        });
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create role";
    }
}

export async function editProjectRole(oldRoleName, projectUuid, newRoleName, writePermission, deletePermission) {
    try {
        const response = await apiClient.post("/projectRole/edit", {
            oldRoleName,
            projectUuid,
            newRoleName,
            writePermission,
            deletePermission,
        });
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't edit role";
    }
}

export async function getProjectRoles(projectUuid) {
    try {
        const response = await apiClient.get(`/project-roles/${projectUuid}/get-roles`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't get project roles";
    }
}

export async function createUserProject(projectName, projectDescription) {
    try {
        const response = await apiClient.post("/project/create", {
            projectName: projectName,
            projectDescription: projectDescription,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create project";
    }
}

export async function getUserProjects() {
    try {
        const response = await apiClient.get("/project/user/me", {});
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create project";
    }
}

export async function softDeleteUserProject(projectuuid) {
    try {
        const response = await apiClient.patch(`/project/soft-delete-project/${projectuuid}/user/me`, {});
        return response.data;
    } catch (err) {
        return err.response.data || "couldn't soft delete the project";
    }
}

export async function reverseSoftDeleteUserProject(projectuuid) {
    try {
        const response = await apiClient.patch(`/project/reverse-soft-delete-project/${projectuuid}/user/me`, {});
        return response.data;
    } catch (err) {
        return err.response.data || "couldn't reverse soft delete of the project";
    }
}

export async function updateActiveProject(projectUuid) {
    try {
        const response = await apiClient.patch("/user/me/updateUserActiveProject", {
            projectUuid: projectUuid,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't set the project as active";
    }
}

export async function getProjectData(projectUuid) {
    try {
        const response = await apiClient.get(`/project/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch project data";
    }
}

export async function getProjectUsers(projectUuid) {
    try {
        const response = await apiClient.get(`/projectUsers/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch project users";
    }
}

export async function getAllSoftDeletedProjectNodes(projectUuid) {
    try {
        const response = await apiClient.get(`/project/soft-deleted-nodes/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch recycled nodes";
    }
}
