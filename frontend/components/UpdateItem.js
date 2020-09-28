import { useState } from 'react';
import Form from "./styles/Form";
import gql from "graphql-tag";
import { Mutation, Query } from 'react-apollo';
import ErrorMessage from "./ErrorMessage";
import Router from 'next/router';

export const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: { id: $id }) {
            id
            title
            description
            price
        }
    }
`;

export const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int ) {
        updateItem(id: $id, title: $title, description: $description, price: $price ) {
            id
            title
            description
            price
        }
    }
`;

const UpdateItem = ({ id }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);

    const onSubmit = async (e, updateItemMutation) => {
        e.preventDefault();
        await updateItemMutation({ variables: { id, title, price, description }});
    };

    return (
        <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
            {({data, loading}) => {
                if(loading) return <p>Loading...</p>;
                if(!data.item) return <p>No Item Found for ID {id}</p>;
                return (
                    <Mutation mutation={UPDATE_ITEM_MUTATION} variables={{ title, description, price }}>
                        {(updateItem, { loading, error}) => (
                            <Form onSubmit={ e => onSubmit(e, updateItem)}>
                                <ErrorMessage error={error}/>
                                <fieldset disabled={loading} aria-busy={loading}>
                                    <label htmlFor='title'>
                                        Title
                                        <input
                                            type='text'
                                            id='title'
                                            name='title'
                                            placeholder='Title'
                                            required
                                            defaultValue={data.item.title}
                                            onChange={(e) => { setTitle(e.target.value) }}/>
                                    </label>
                                    <label htmlFor='price'>
                                        Price
                                        <input
                                            type='number'
                                            id='price'
                                            name='price'
                                            placeholder='Price'
                                            required
                                            defaultValue={data.item.price}
                                            onChange={(e) => { setPrice(parseFloat(e.target.value)) }}/>
                                    </label>
                                    <label htmlFor='description'>
                                        Description
                                        <textarea
                                            id='description'
                                            name='description'
                                            placeholder='Enter a description'
                                            required
                                            defaultValue={data.item.description}
                                            onChange={(e) => { setDescription(e.target.value) }}/>
                                    </label>
                                    <button type='submit'>Sav{loading ? 'ing' : 'e'} Changes</button>
                                </fieldset>
                            </Form>
                        )}
                    </Mutation>
                )
            }}
        </Query>
    );
};

export default UpdateItem;
