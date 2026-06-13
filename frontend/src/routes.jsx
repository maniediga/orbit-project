import AuthPage from "#pages/AuthPages";
import ErrorPage from "#pages/ErrorPage";
import VerifyEmailPage from "#pages/VerifyEmailPage";
import App from "./App";

import ProjectComponent from "#components/mainContent/ProjectComponent";
import DeletedProjectComponent from "#components/mainContent/DeletedProjectComponent";
import KanBhanComponent from "#components/mainContent/KanbhanComponent";
import TreeViewComponent from "#components/mainContent/TreeViewComponent";
import ProfileComponent from "#components/mainContent/ProfileComponent";

import { Invites } from "#components/invites";

import * as AuthForms from "#components/forms/AuthForms";
import * as ProjectForms from "#components/forms/ProjectForms";
import * as UserForms from "#components/forms/UserForms";
import * as TreeForms from "#components/forms/TreeForms";

import { PopUpSmall } from "#components/ui/PopUpSmall";
import { PopUpMedium } from "#components/ui/PopUpMedium";
import EmailVerificationComponent from "#components/auth/EmailVerificationComponent";
import CategoryDetails from "#components/nodeDetails/CategoryDetails";
import FeatureDetails from "#components/nodeDetails/FeatureDetails";
import ProjectDetails from "#components/nodeDetails/ProjectDetails";

import { loader as loadProjectInvites } from "#components/invites";
import { loader as loadUserDetailsForProject } from "#components/nodeDetails/ProjectDetails";
import { loader as loadUserProjects } from "#components/mainContent/ProjectComponent";
import { loader as loadUserDetails } from "./App.jsx";
import { loader as loadProjectData } from "#components/mainContent/TreeViewComponent";
import { loader as loadProjectUsers } from "./loaders/loadProjectUsers";
import { loader as loadCategoryDetails } from "./loaders/loadCategoryDetails";
import { loader as loadFeatureDetails } from "./loaders/loadFeatureDetails";
import RecycleBin, { loader as loadSoftDeletedNodes } from "#components/mainContent/RecycleBin";
import VerificationProtectedLayout from "#components/layouts/VerificationProtectedLayout";

const routes = [
    {
        path: "/",
        element: <App />,
        loader: loadUserDetails,
        errorElement: <ErrorPage />,
        children: [
            // All routes below can't be accessed without logging in
            // profile route is a top-level child (always accessible) regardless of email verification status
            {
                path: "profile/me",
                element: <ProfileComponent />,
                children: [
                    { path: "change-display-name", element: <PopUpSmall>{<UserForms.ChangeDisplayNameForm />}</PopUpSmall> },
                    { path: "log-out", element: <PopUpSmall>{<AuthForms.LogOutConfirmation />}</PopUpSmall> },
                    {
                        path: "invites", element: <PopUpMedium><Invites /></PopUpMedium>,
                        loader: loadProjectInvites
                    },
                ],
            },
            // verification protected routes are wrapped verification protected layout not accessible without email verification
            {
                element: <VerificationProtectedLayout />,
                children: [
                    {
                        path: "project/user/me",
                        element: <ProjectComponent />,
                        loader: loadUserProjects,
                        children: [{ path: "create-user-project", element: <PopUpMedium>{<ProjectForms.CreateUserProjectForm />}</PopUpMedium> }],
                    },
                    {
                        path: "project/deleted/user/me",
                        element: <DeletedProjectComponent />,
                        loader: loadUserProjects,
                    },
                    { path: "kanbhan/:projectUuid", element: <KanBhanComponent /> },
                    { path: "recycle-bin/:projectUuid", element: <RecycleBin />, loader: loadSoftDeletedNodes },
                    {
                        path: "tree-view/:projectUuid",
                        element: <TreeViewComponent />,
                        loader: loadProjectData,
                        children: [
                            {
                                path: "node/:projectUuid/add-role",
                                element: <PopUpSmall><ProjectForms.AddRoleForm /></PopUpSmall>
                            },
                            {
                                path: "node/:projectUuid/edit-role/:roleName",
                                element: <PopUpSmall><ProjectForms.EditRoleForm /></PopUpSmall>
                            },
                            {
                                path: "node/:projectUuid/invite-users",
                                element: <PopUpSmall><ProjectForms.InviteUserForm /></PopUpSmall>
                            },
                            {
                                path: "node/:projectUuid/view-project-details",
                                element: <PopUpMedium><ProjectDetails /></PopUpMedium>,
                                loader: loadUserDetailsForProject,
                            },
                            {
                                path: "node/:nodeUuid/view-category-details",
                                element: <PopUpMedium><CategoryDetails /></PopUpMedium>,
                                loader: loadCategoryDetails,
                            },
                            {
                                path: "node/:categoryUuid/:nodeUuid/view-feature-details",
                                element: <PopUpMedium><FeatureDetails /></PopUpMedium>,
                                loader: loadFeatureDetails
                            },
                            {
                                path: "node/:nodeUuid/add-new-category",
                                element: <PopUpMedium><TreeForms.CreateCategory /></PopUpMedium>,
                            },
                            {
                                path: "node/:nodeUuid/add-new-feature",
                                element: <PopUpMedium><TreeForms.CreateFeature /></PopUpMedium>,
                                loader: loadProjectUsers
                            },
                        ]
                    },
                ]
            }
        ],
    },
    {
        path: "auth",
        element: <AuthPage />,
        children: [
            { path: "login", element: <AuthForms.AuthForm /> },
            { path: "register", element: <AuthForms.AuthForm /> },
            { path: "get-email-verification-link/me", element: <EmailVerificationComponent /> }
        ],
    },
    {
        path: "verify-email/:token",
        element: <VerifyEmailPage />,
    },
];

export default routes;
