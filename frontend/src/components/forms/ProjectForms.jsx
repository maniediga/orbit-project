import { Form, useNavigate, useParams } from "react-router";
import { useState } from "react";
import * as projectServices from "#services/projectServices"
import Input from "#components/ui/Input";
import NavButton from "#components/ui/NavButton";
import { useProjectsContext } from "#contexts/ProjectsContext";
import LongInput from "#components/ui/LongInput";
import { useTreeContext } from "#contexts/TreeContext";

export function CreateUserProjectForm() {
    const [input, setInput] = useState({
        projectName: "",
        projectDescription: ""
    });
    const { projects, setProjects } = useProjectsContext();
    const navigate = useNavigate();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        const response = await projectServices.createUserProject(input.projectName, input.projectDescription);

        localStorage.setItem(`project-${response.data.uuid}-expansionState`, "{}");

        projects.push(response.data);
        setProjects(projects);

        navigate("/project/user/me");
    };

    return (
        <Form onSubmit={handleSubmit} className="flex w-full h-full flex-col items-center justify-center">
            <div className="mb-6 text-2xl">Create Project</div>
            <Input name="projectName" onChange={handleInput} placeholder="Project name" isRequired={true} />
            <LongInput name="projectDescription" onChange={handleInput} placeholder="Project description" cssClasses="h-8/12" />
            <NavButton type={"submit"} buttonText={"Confirm"} extraClasses="w-8/12" />
        </Form >
    );
}

export function EditRoleForm() {
    const navigate = useNavigate();
    const { roleName } = useParams();
    const [input, setInput] = useState({ name: "", writePermission: false, deletePermission: false });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const projectUuid = useParams().projectUuid;
    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.name === 'writePermission' || e.target.name === 'deletePermission' ? e.target.checked : e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async () => {
        setSuccess(null);
        setError(null);
        if (input.role === "") {
            setError("Select a role");
            return;
        }
        const response = await projectServices.editProjectRole(roleName, projectUuid, input.name, input.writePermission, input.deletePermission);
        if (response.success) {
            setSuccess(response.message);
            setTimeout(() => { navigate(-2) }, 2000);
            setInput({ name: "", writePermission: false, deletePermission: false });
        } else {
            setError(response.message);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col items-center">
            {error && <div className="text-red-700">{error}</div>}
            {success && <div className="text-green-700">{success}</div>}
            <div className="mb-6 text-2xl">Edit project role ({roleName})</div>
            <div className="w-full flex">
                <input name="name" className="input ml-8" onChange={handleInput} value={input.name} placeholder="New role name" required={true} />
            </div>
            <div className="mx-auto">
                <input type="checkbox" id="writePermission" name="writePermission" onClick={handleInput} className="w-4 h-4 mr-2" />
                <label htmlFor="writePermission" className="text-xl mr-8">Write Permission</label>
                <input type="checkbox" id="deletePermission" name="deletePermission" onClick={handleInput} className="w-4 h-4 mr-2" />
                <label htmlFor="deletePermission" className="text-xl">Delete Permission</label>
            </div>
            <div className="w-1/3 h-full flex flex-col justify-end">
                <button type={"submit"} className="button mb-[10%]">Confirm</button>
            </div>
        </Form>
    );
}

export function AddRoleForm() {
    const [input, setInput] = useState({ name: "", writePermission: false, deletePermission: false });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const projectUuid = useParams().projectUuid;
    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.name === 'writePermission' || e.target.name === 'deletePermission' ? e.target.checked : e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async () => {
        setSuccess(null);
        setError(null);
        if (input.role === "") {
            setError("Select a role");
            return;
        }
        const response = await projectServices.createProjectRole(projectUuid, input.name, input.writePermission, input.deletePermission);
        if (response.success) {
            setSuccess(response.message);
            setInput({ name: "", writePermission: false, deletePermission: false });
        } else {
            setError(response.message);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col items-center">
            {error && <div className="text-red-700">{error}</div>}
            {success && <div className="text-green-700">{success}</div>}
            <div className="mb-6 text-2xl">Add project role</div>
            <div className="w-full flex">
                <input name="name" className="input ml-8" onChange={handleInput} value={input.name} placeholder="Role name" required={true} />
            </div>
            <div className="mx-auto">
                <input type="checkbox" id="writePermission" name="writePermission" onClick={handleInput} className="w-4 h-4 mr-2" />
                <label htmlFor="writePermission" className="text-xl mr-8">Write Permission</label>
                <input type="checkbox" id="deletePermission" name="deletePermission" onClick={handleInput} className="w-4 h-4 mr-2" />
                <label htmlFor="deletePermission" className="text-xl">Delete Permission</label>
            </div>
            <div className="w-1/3 h-full flex flex-col justify-end">
                <button type={"submit"} className="button mb-[10%]">Confirm</button>
            </div>
        </Form>
    );
}

export function InviteUserForm() {
    const navigate = useNavigate();
    const [input, setInput] = useState({ email: "", role: "" });
    const [error, setError] = useState(null);
    const [treeData, _] = useTreeContext();
    const [success, setSuccess] = useState(null);
    const projectUuid = useParams().projectUuid;
    const roles = treeData.projectNode.roles;

    const handleInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setSuccess(null);
        setError(null);
        if (input.role === "") {
            setError("Select a role");
            return;
        }
        const response = await projectServices.inviteUser(projectUuid, input.email, input.role);
        if (response.success) {
            setSuccess(response.message);
            // Navigate back to remove the query parameters form the url
            navigate(-1);
            setInput({ email: "", role: "" });
        } else {
            setError(response.message);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="h-full w-full flex flex-col items-center">
            {error && <div className="text-red-700">{error}</div>}
            {success && <div className="text-green-700">{success}</div>}
            <div className="mb-6 text-2xl">Invite user to project</div>
            <div className="w-full flex">
                <input name="email" className="input ml-8" onChange={handleInput} value={input.email} placeholder="Email" required={true} />
                <select name="role" className="mx-8 border-1 h-2/3 w-30 border-purple-200 rounded-md" onChange={handleInput}>
                    <option className="bg-gray-800" key="default" value="">Role</option>
                    {roles.map(role => <option className="bg-gray-800" key={role.name} value={role.name}>{role.name}</option>)}
                </select>
            </div>
            <div className="w-1/3 h-full flex flex-col justify-end">
                <button type={"submit"} className="button mb-[10%]">Confirm</button>
            </div>
        </Form>
    );
}
