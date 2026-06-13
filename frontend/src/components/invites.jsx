import { acceptProjectInvite, getUserProjectInvites } from "#services/projectServices";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";

export async function loader() {
    const response = await getUserProjectInvites();
    if (!response.success)
        return []
    return response.data;
}

export function Invites() {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const invites = useLoaderData();

    const handleInviteAccept = async (inviteCode) => {
        setError(null);
        setSuccess(null);
        const response = await acceptProjectInvite(inviteCode);
        console.log(response);
        if (!response.success) {
            setError(response.message);
        } else {
            setSuccess(response.message);
        }
    }

    const handleInviteReject = async (inviteCode) => {
        const response = await rejectProjectInvite(inviteCode);
        if (!response.success) {
            setError(response.message);
        } else {
            setSuccess(response.message);
        }
    }

    return (
        <div className="h-[86%] w-10/12 overflow-auto">
            <div className="flex justify-center text-2xl font-bold">Project Invites</div>
            {error && <div className="text-red-700">{error}</div>}
            {success && <div className="text-green-700">{success}</div>}
            {
                invites.length == 0 ?
                    <div className="text-4xl flex justify-center items-center h-10/12 w-full">No new invites</div> :
                    <div className="mt-3">
                        {
                            invites?.map(invite => <div key={invite.invitecode}
                                className="flex items-center h-18 rounded-md my-2 text-gray-300 text-xl pl-4 bg-gray-900">
                                <div className="w-7/12">

                                    Project: {invite.projectname}
                                    <div>
                                        From: {invite.inviteremail}
                                    </div>
                                </div>
                                <div className="flex justify-evenly items-center w-5/12">
                                    <button type="button" className="flex items-center text-white text-sm h-10 justify-center border-2 border-blue-500 px-4 py-2 md:px-6 md:py-3 font-bold rounded-md hover:cursor-pointer hover:bg-blue-500"
                                        onClick={() => handleInviteAccept(invite.invitecode)}>
                                        Accept
                                    </button>
                                    <button type="button" className="flex items-center text-white text-sm h-10 justify-center border-2 border-red-500 px-4 py-2 md:px-6 md:py-3 font-bold rounded-md hover:cursor-pointer hover:bg-red-500">
                                        Reject
                                    </button>
                                </div>
                            </div>
                            )
                        }
                    </div>
            }
        </div>
    );
}
