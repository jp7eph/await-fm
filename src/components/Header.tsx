import { PlatformLinks } from "./PlatformLinks";

export function Header() {
  return (
    <section className="mt-18 mx-auto max-w-screen-xl pb-4 px-4 sm:px-8">
      <div className="text-center space-y-4">
        <h1 className="text-gray-800 font-bold text-4xl md:text-5xl">await.fm</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          同期エンジニアが気になる技術やガジェットの未来を await しながら
          <br />
          ゆるく語る技術雑談系ポッドキャスト
        </p>
      </div>
      <div className="mt-12 justify-center items-center space-y-0 space-x-2 md:space-x-6 flex">
        <PlatformLinks />
      </div>
    </section>
  );
}
