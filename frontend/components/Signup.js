import { useState } from "react";
import { Mutation } from 'react-apollo';
import Form from "./styles/Form";
import gql from "graphql-tag";
import DisplayError from "./ErrorMessage";

const SIGNUP_MUTATION = gql`
    mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
        signup(email: $email, name: $name, password: $password) {
            id
            email
            name
        }
    }
`;

const Signup = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    return (
        <Mutation mutation={SIGNUP_MUTATION} variables={{ email, name, password }}>
            {(signup, { error, loading }) => (
                <Form method="post" onSubmit={ async e => {
                    e.preventDefault();
                    await signup();
                    setEmail('');
                    setName('');
                    setPassword('');
                }}>
                    <fieldset disabled={loading} aria-busy={loading}>
                        <h2>Sing Up for An Account</h2>
                        <DisplayError error={error}/>
                        <label htmlFor="email">
                            Email
                            <input
                                type="email"
                                name="email"
                                placeholder="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        <label htmlFor="name">
                            Name
                            <input
                                type="text"
                                name="name"
                                placeholder="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
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
                        <button type="submit">Sign Up!</button>
                    </fieldset>
                </Form>
            )}
        </Mutation>
    );
};

export default Signup;
