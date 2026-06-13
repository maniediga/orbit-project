import { useTreeContext } from "#contexts/TreeContext";
import { getUserDetailsForProject } from "#services/projectServices";
import { useLoaderData } from "react-router";
import { useNavigate } from "react-router";

export async function loader({ params }) {
    const projectUuid = params.projectUuid;
    const user = await getUserDetailsForProject(projectUuid);
    if (!user.success)
        return {};
    return user.data;
}

export default function ProjectDetails() {
    const [treeData, setTreeData] = useTreeContext();
    const user = useLoaderData();
    const navigate = useNavigate();
    const projectDetails = treeData.projectNode;

    const handleAddMember = () => {
        navigate(`/tree-view/${projectDetails.uuid}/node/${projectDetails.uuid}/invite-users`, { replace: true });
    }

    const handleAddRole = () => {
        navigate(`/tree-view/${projectDetails.uuid}/node/${projectDetails.uuid}/add-role`, { replace: true });
    }

    const handleEditRole = (name) => {
        navigate(`/tree-view/${projectDetails.uuid}/node/${projectDetails.uuid}/edit-role/${name}`, { replace: true });
    }

    return (
        <div className="h-[86%] w-10/12 overflow-auto">
            <div className="text-center text-3xl font-bold">Project Details</div>
            <div className="scroller-slim">
                <div className="text-2xl text-gray-300">Project name:</div>
                <div className="flex flex-col justify-center h-16 rounded-md text-gray-200 text-xl text-center bg-gray-700">{projectDetails.name}</div>
                <div className="text-2xl mt-4 text-gray-300">Project description:</div>
                <div className="h-100 whitespace-pre-wrap mb-6 bg-gray-700 p-4 text-xl text-gray-200 rounded-md scroller-slim">
                    {projectDetails.description || "Category description not provided"}
                </div>
                <div className="flex justify-baseline mb-4 items-center">
                    <div className="text-2xl mt-4 text-gray-300 inline">Project Roles:</div>
                    <button className="button-square-small ml-6 inline" onClick={handleAddRole}>Add</button>
                </div>
                {
                    projectDetails.roles?.map(role =>
                        <div key={`${role.name}`} className="flex items-center h-12 rounded-md my-2 text-gray-200 text-xl pl-4 bg-gray-900">
                            {role.name}
                            <div className="flex grow justify-end pr-14 h-10/12">
                                <div className="flex items-center border-2 border-gray-500 rounded-sm pl-4 py-0.5 mr-4">
                                    Permissions:
                                    <div className={role.writePermission ? "flex items-center h-full rounded-md mx-6 px-4 text-gray-900 bg-green-500" : "flex items-center h-full rounded-md mx-6 px-4 text-gray-900 bg-red-500"}>Write</div>
                                    <div className={role.deletePermission ? "flex items-center h-full rounded-md px-4 mr-4 text-gray-900 bg-green-500" : "flex items-center h-full rounded-md px-4 mr-4 text-gray-900 bg-red-500"}>Delete</div>
                                </div>
                                {
                                    user.role == "Manager" ?
                                        <button className="flex items-center text-white h-full justify-center border-2 border-blue-500 px-4 py-2 md:px-6 md:py-3 font-bold rounded-md hover:cursor-pointer hover:bg-blue-500" onClick={() => handleEditRole(role.name)}>Edit</button> :
                                        ""
                                }
                            </div>
                        </div>)
                }
                <div className="flex justify-baseline mb-4 items-center">
                    <div className="text-2xl mt-4 text-gray-300 inline">Project members:</div>
                    <button className="button-square-small ml-6 inline" onClick={handleAddMember}>Add</button>
                </div>
                {projectDetails.users?.map(user => <div key={`${user.name}`} className="flex flex-col justify-center h-12 rounded-md text-gray-200 text-xl pl-4 bg-gray-900">{user.displayName} ({user.name})</div>)}
            </div>
        </div>
    );
}
