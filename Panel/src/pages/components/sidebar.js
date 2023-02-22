import { useRouter } from 'next/router';

export default function SideBar({ children }) {
    const router = useRouter();
    const menuItems = [
        {
          href: '/',
          title: 'Homepage',
        },
        {
          href: '/docs',
          title: 'Docs',
        },
        {
          href: '/login',
          title: 'login',
        },
      ];

    return (
<aside className='bg-fuchsia-100 w-full md:w-60'>
  <nav>
    <ul>
      {menuItems.map(({ href, title }) => (
        <li className='m-2' key={title}>
          <Link href={router.asPath === href && 'bg-fuchsia-600 text-white'}>
            <a
              className={`flex p-2 bg-fuchsia-200 rounded hover:bg-fuchsia-400 cursor-pointer`}
            >
              {title}
            </a>
          </Link>
        </li>
      ))}
    </ul>
  </nav>
</aside>
    );
}