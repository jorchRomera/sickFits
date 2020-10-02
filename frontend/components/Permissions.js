import { Query } from 'react-apollo';
import DisplayError from "./ErrorMessage";
import gql from "graphql-tag";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";

const permissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE',
];

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
                                {permissions.map(permission => <th>{permission}</th>)}
                                <th>↓</th>
                            </tr>
                        </thead>
                        <tbody>{data.users.map(user => <User user={user} />)}</tbody>
                    </Table>
                </div>
            )
        }}
    </Query>
);

const User = ({ user }) => (
    <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {permissions.map(permission => (
            <td>
                <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input type='checkbox'/>
                </label>
            </td>
        ))}
        <td><SickButton>Update</SickButton></td>
    </tr>
);

export default Permissions;
