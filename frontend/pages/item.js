import SingleItem from "../components/SingleItem";

const Item = ({ query: { id } }) => {
    console.log(id, 'itempage')
    return (
        <div>
            <SingleItem id={id}/>
        </div>
    );
}

export default Item;
