import { Query, Mutation } from 'react-apollo';
import CartStyles from "./styles/CartStyles";
import CloseButton from "./styles/CloseButton";
import Supreme from "./styles/Supreme";
import SickButton from "./styles/SickButton";
import gql from "graphql-tag";

export const LOCAL_STATE_QUERY = gql`
    query localState {
        cartOpen @client
    }
`;

export const TOGGLE_CART_MUTATION = gql`
    mutation toggleCart {
        toggleCart @client
    }
`;

const Cart = () => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
        {(toggleCart) => (
            <Query query={LOCAL_STATE_QUERY}>
                {({ data: { cartOpen } }) => (
                    <CartStyles open={cartOpen}>
                        <header>
                            <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
                            <Supreme>Your Cart</Supreme>
                            <p>You Have __ items in your cart.</p>
                        </header>
                        <footer>
                            <p>$10.10</p>
                            <SickButton>Checkout</SickButton>
                        </footer>
                    </CartStyles>
                )}
            </Query>
        )}
    </Mutation>
);

export default Cart;
