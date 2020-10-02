import {useState} from "react";
import {Mutation} from 'react-apollo';
import Form from "./styles/Form";
import gql from "graphql-tag";
import DisplayError from "./ErrorMessage";

const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION($email: String!) {
        requestReset(email: $email) {
            message
        }
    }
`;

const RequestReset = () => {
    const [email, setEmail] = useState('');
    return (
        <Mutation
            mutation={REQUEST_RESET_MUTATION}
            variables={{ email }}
        >
            {(reset, { error, loading, called }) => (
                <Form method="post" onSubmit={ async e => {
                    e.preventDefault();
                    await reset();
                    setEmail('');
                }}>
                    <fieldset disabled={loading} aria-busy={loading}>
                        <h2>Request a password reset</h2>
                        <DisplayError error={error}/>
                        {!error && !loading && called && <p>Success! Check your email for a reset link!</p>}
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
                        <button type="submit">Request Reset!</button>
                    </fieldset>
                </Form>
            )}
        </Mutation>
    );
};

export default RequestReset;
