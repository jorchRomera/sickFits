import React from 'react';
import PropTypes from 'prop-types';
import ItemStyles from "./styles/ItemStyles";
import Title from "./styles/Title";
import Link from 'next/link';
import PriceTag from "./styles/PriceTag";
import formatMoney from "../lib/formatMoney";

const Item = ({ item }) => {
    return (
        <ItemStyles>
            {item.image && <img src={item.image} alt={item.title} />}
            <Title>
                <Link href={{
                    pathname: '/item',
                    query: { id: item.id }
                }}>
                    <a>{item.title}</a>
                </Link>
            </Title>
            <PriceTag>{formatMoney(item.price)}</PriceTag>
            <p>{item.description}</p>
            <div className="buttonList">
                <Link href={{
                    pathname: 'update',
                    query: { id: item.id },
                }}>
                    <a>Edit</a>
                </Link>
                <button>Add To Cart</button>
                <button>Delete</button>
            </div>
        </ItemStyles>
    );
};

Item.propTypes = {
    item: PropTypes.object.isRequired,
};

export default Item;