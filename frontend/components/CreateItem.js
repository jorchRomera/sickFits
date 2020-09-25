import { useState } from 'react';
import Form from "./styles/Form";
import gql from "graphql-tag";
import { Mutation } from 'react-apollo';
import ErrorMessage from "./ErrorMessage";
import Router from 'next/router';

export const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $price: Int!
        $image: String
        $largeImage: String
    ) {
        createItem(
            title: $title
            description: $description
            price: $price
            image: $image
            largeImage: $largeImage
        ) {
            id
        }
    }
`;

const CreateItem = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [largeImage, setLargeImage] = useState('');
    const [price, setPrice] = useState(0);

    const uploadImage = async (e) => {
        const files = e.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'sickfits');
        const res = await fetch('https://api.cloudinary.com/v1_1/jorch/image/upload', {method: 'POST', body: data});
        const file = await res.json();
        setImage(file.secure_url);
        setLargeImage(file.eager[0].secure_url);
    };

    return (
        <Mutation mutation={CREATE_ITEM_MUTATION} variables={{ title, description, price, image, largeImage }}>
            {(createItem, { loading, error}) => (
                <Form onSubmit={async e => {
                    e.preventDefault();
                    const res = await createItem();
                    Router.push({
                        pathname: '/item',
                        query: { id: res.data.createItem.id },
                    });
                }}>
                    <ErrorMessage error={error}/>
                    <fieldset disabled={loading} aria-busy={loading}>
                        <label htmlFor='file'>
                            Title
                            <input
                                type='file'
                                id='file'
                                name='file'
                                placeholder='Upload an Image'
                                required
                                onChange={uploadImage}/>
                            {image && <img src={image} width='200' alt='Upload Preview' />}
                        </label>
                        <label htmlFor='title'>
                            Title
                            <input
                                type='text'
                                id='title'
                                name='title'
                                placeholder='Title'
                                required
                                value={title}
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
                                value={price}
                                onChange={(e) => { setPrice(parseFloat(e.target.value)) }}/>
                        </label>
                        <label htmlFor='description'>
                            Description
                            <textarea
                                id='description'
                                name='description'
                                placeholder='Enter a description'
                                required
                                value={description}
                                onChange={(e) => { setDescription(e.target.value) }}/>
                        </label>
                        <button type='submit'>Submit</button>
                    </fieldset>
                </Form>
            )}
        </Mutation>
    );
};

export default CreateItem;
