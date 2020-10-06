import styled from "styled-components";

const BigButton = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    &:hover {
        color: ${props => props.theme.red};
        cursor: pointer;
    }
`;

const RemoveFromCart = () => (
    <BigButton titlle="Delete Item">&times;</BigButton>
);

export default RemoveFromCart;
