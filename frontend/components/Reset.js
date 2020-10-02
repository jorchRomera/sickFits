import { useState } from "react";
import { Mutation } from 'react-apollo';
import Form from "./styles/Form";
import gql from "graphql-tag";
import DisplayError from "./ErrorMessage";
import {CURRENT_USER_QUERY} from "./User";

const RESET_MUTATION = gql`
    mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
        resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
            id
            email
            name
        }
    }
`;

const Reset = ({ resetToken }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    return (
        <Mutation
            mutation={RESET_MUTATION}
            variables={{ resetToken, password, confirmPassword }}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        >
            {(reset, { error, loading }) => (
                <Form method="post" onSubmit={ async e => {
                    e.preventDefault();
                    await reset();
                    setPassword('');
                    setConfirmPassword('');
                }}>
                    <fieldset disabled={loading} aria-busy={loading}>
                        <h2>Reset Your Password</h2>
                        <DisplayError error={error}/>
                        <label htmlFor="password">
                            Password
                            <input
                                type="password"
                                name="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                        <label htmlFor="confirmPassword">
                            Confirm Password
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </label>
                        <button type="submit">Reset your password!</button>
                    </fieldset>
                </Form>
            )}
        </Mutation>
    );
};

export default Reset;
