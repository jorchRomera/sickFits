import { Query, Mutation } from 'react-apollo';
import DisplayError from "./ErrorMessage";
import gql from "graphql-tag";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import {useState} from "react";

const permissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE',
];

export const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation updatePermissions($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            permissions
            name
            email
        }
    }
`;

export const ALL_USERS_QUERY = gql`
    query ALL_USERS_QUERY {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const Permissions = () => (
    <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <DisplayError error={error}/>;
            return (
                <div>
                    <h2>Manage Permissions</h2>
                    <Table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            {permissions.map(permission => <th key={permission}>{permission}</th>)}
                            <th>↓</th>
                        </tr>
                        </thead>
                        <tbody>{data.users.map(user => <UserPermissions user={user} key={user.id} />)}</tbody>
                    </Table>
                </div>
            )
        }}
    </Query>
);

const UserPermissions = ({ user }) => {
    const [userPermissions, setUserPermissions] = useState(user.permissions);
    const handlePermissionChange = (e) => {
        let checkbox = e.target;
        let updatedPermissions = [...userPermissions];
        if (checkbox.checked) { updatedPermissions.push(checkbox.value) }
        else { updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value) }
        setUserPermissions(updatedPermissions);
    };
    return (
        <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{ permissions: userPermissions, userId: user.id}}>
            {(updatePermissions, { loading, error }) => (
                <>
                    {error && <tr><td colSpan={9}><DisplayError error={error}/></td></tr>}
                    <tr>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        {permissions.map(permission => (
                            <td key={permission}>
                                <label htmlFor={`${user.id}-permission-${permission}`}>
                                    <input
                                        id={`${user.id}-permission-${permission}`}
                                        type='checkbox'
                                        checked={userPermissions.includes(permission)}
                                        value={permission}
                                        onChange={handlePermissionChange}
                                    />
                                </label>
                            </td>
                        ))}
                        <td>
                            <SickButton
                                type="button"
                                disabled={loading}
                                onClick={updatePermissions}
                            >
                                Updat{loading ? 'ing': 'e'}
                            </SickButton>
                        </td>
                    </tr>
                </>
            )}
        </Mutation>
    );
}

export default Permissions;
