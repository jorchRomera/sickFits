import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from "./User";
import Signout from "./Signout";

// noinspection HtmlUnknownTarget
const Nav = () => (
        <User>{
            ({ data }) => {
                if (!data) return null;
                return (
                    <NavStyles>
                        <Link href='/items'>
                            <a>Shop</a>
                        </Link>
                        {data.me && (
                            <>
                                <Link href='/sell'>
                                    <a>Sell</a>
                                </Link>
                                <Link href='/orders'>
                                    <a>Orders</a>
                                </Link>
                                <Link href='/me'>
                                    <a>Account</a>
                                </Link>
                                <Signout/>
                            </>
                        )}
                        {!data.me && (
                            <Link href='/signup'>
                                <a>Sign In</a>
                            </Link>
                        )}
                    </NavStyles>
                )
            }}
        </User>
);

export default Nav;
