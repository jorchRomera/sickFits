import { Query, Mutation } from 'react-apollo';
import CartStyles from "./styles/CartStyles";
import CloseButton from "./styles/CloseButton";
import Supreme from "./styles/Supreme";
import SickButton from "./styles/SickButton";
import gql from "graphql-tag";
import User from "./User";
import CartItem from "./CartItem";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";

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
    <User>
        {({ loading, data}) => {
            if (loading) return null;
            if (!data.me) return null;
            return (
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                    {(toggleCart) => (
                        <Query query={LOCAL_STATE_QUERY}>
                            {({ data: { cartOpen } }) => (
                                <CartStyles open={cartOpen}>
                                    <header>
                                        <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
                                        <Supreme>{data.me.name}'s Cart</Supreme>
                                        <p>You Have {data.me.cart.length} item{data.me.cart.length === 1 ? '' : 's'} in your cart.</p>
                                    </header>
                                    <ul>
                                        {data.me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem}/>)}
                                    </ul>
                                    <footer>
                                        <p>{formatMoney(calcTotalPrice(data.me.cart))}</p>
                                        <SickButton>Checkout</SickButton>
                                    </footer>
                                </CartStyles>
                            )}
                        </Query>
                    )}
                </Mutation>
            );
        }}
    </User>
);

export default Cart;
