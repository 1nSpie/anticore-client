"use client";
import Link from "next/link";
import FeedbackLine from "../ui/ui/FeedbackLine";

export default function PrivacyPolicyPage() {
  const SITE_LINK = process.env.SITE_LINK || "http://localhost:3000";
  console.log("✌️SITE_LINK --->", SITE_LINK);
  return (
    <>
      <div className="min-h-screen bg-background dark:bg-backgroundDark py-12 px-6">
        <div className="max-w-4xl mx-auto bg-background1 dark:bg-backgroundDark1 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-6">
            Политика в отношении обработки персональных данных
          </h1>
          {/* Раздел 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              1. Общие положения
            </h2>
            <p className="text-black dark:text-white leading-relaxed">
              Настоящая политика обработки персональных данных составлена в
              соответствии с требованиями Федерального закона от 27.07.2006 №
              152-ФЗ «О персональных данных» (далее — Закон о персональных
              данных) и определяет порядок обработки персональных данных и меры
              по обеспечению безопасности персональных данных, предпринимаемые
              Антикор Сервис Жуковский (далее — Оператор).
            </p>
            <p className="text-black dark:text-white leading-relaxed mt-2">
              Оператор ставит своей важнейшей целью и условием осуществления
              своей деятельности соблюдение прав и свобод человека и гражданина
              при обработке его персональных данных, в том числе защиты прав на
              неприкосновенность частной жизни, личную и семейную тайну.
            </p>
            <p className="text-black dark:text-white leading-relaxed mt-2">
              Настоящая политика Оператора в отношении обработки персональных
              данных (далее — Политика) применяется ко всей информации, которую
              Оператор может получить о посетителях веб-сайта{" "}
              <a href={SITE_LINK} className="text-orange hover:underline">
                {SITE_LINK}{" "}
              </a>
              .
            </p>
          </section>

          {/* Раздел 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              2. Основные понятия, используемые в Политике
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>
                  Автоматизированная обработка персональных данных
                </strong>{" "}
                — обработка персональных данных с помощью средств вычислительной
                техники.
              </li>
              <li>
                <strong>Блокирование персональных данных</strong> — временное
                прекращение обработки персональных данных (за исключением
                случаев, если обработка необходима для уточнения персональных
                данных).
              </li>
              <li>
                <strong>Веб-сайт</strong> — совокупность графических и
                информационных материалов, а также программ для ЭВМ и баз
                данных, обеспечивающих их доступность в сети интернет по
                сетевому адресу{" "}
                <a href={SITE_LINK} className="text-orange hover:underline">
                  {SITE_LINK}{" "}
                </a>
                .
              </li>
              <li>
                <strong>Информационная система персональных данных</strong> —
                совокупность содержащихся в базах данных персональных данных и
                обеспечивающих их обработку информационных технологий и
                технических средств.
              </li>
              <li>
                <strong>Обезличивание персональных данных</strong> — действия, в
                результате которых невозможно определить без использования
                дополнительной информации принадлежность персональных данных
                конкретному Пользователю или иному субъекту персональных данных.
              </li>
              <li>
                <strong>Обработка персональных данных</strong> — любое действие
                (операция) или совокупность действий (операций), совершаемых с
                использованием средств автоматизации или без использования таких
                средств с персональными данными, включая сбор, запись,
                систематизацию, накопление, хранение, уточнение (обновление,
                изменение), извлечение, использование, передачу
                (распространение, предоставление, доступ), обезличивание,
                блокирование, удаление, уничтожение персональных данных.
              </li>
              <li>
                <strong>Оператор</strong> — государственный орган, муниципальный
                орган, юридическое или физическое лицо, самостоятельно или
                совместно с другими лицами организующие и/или осуществляющие
                обработку персональных данных, а также определяющие цели
                обработки персональных данных, состав персональных данных,
                подлежащих обработке, действия (операции), совершаемые с
                персональными данными.
              </li>
              <li>
                <strong>Персональные данные</strong> — любая информация,
                относящаяся прямо или косвенно к определенному или определяемому
                Пользователю веб-сайта{" "}
                <a href={SITE_LINK} className="text-orange hover:underline">
                  {SITE_LINK}{" "}
                </a>
                .
              </li>
              <li>
                <strong>Пользователь</strong> — любой посетитель веб-сайта{" "}
                <a href={SITE_LINK} className="text-orange hover:underline">
                  {SITE_LINK}{" "}
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Раздел 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              3. Основные права и обязанности Оператора
            </h2>
            <h3 className="font-medium text-black dark:text-white mt-3">
              3.1. Оператор имеет право:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                получать от субъекта персональных данных достоверные информацию
                и/или документы, содержащие персональные данные;
              </li>
              <li>
                в случае отзыва субъектом персональных данных согласия на
                обработку персональных данных, а также направления обращения с
                требованием о прекращении обработки персональных данных,
                Оператор вправе продолжить обработку персональных данных без
                согласия субъекта персональных данных при наличии оснований,
                указанных в Законе о персональных данных;
              </li>
              <li>
                самостоятельно определять состав и перечень мер, необходимых и
                достаточных для обеспечения выполнения обязанностей,
                предусмотренных Законом о персональных данных и принятыми в
                соответствии с ним нормативными правовыми актами, если иное не
                предусмотрено Законом о персональных данных или другими
                федеральными законами.
              </li>
            </ul>

            <h3 className="font-medium text-black dark:text-white mt-3">
              3.2. Оператор обязан:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                предоставлять субъекту персональных данных по его просьбе
                информацию, касающуюся обработки его персональных данных;
              </li>
              <li>
                организовывать обработку персональных данных в порядке,
                установленном действующим законодательством РФ;
              </li>
              <li>
                отвечать на обращения и запросы субъектов персональных данных и
                их законных представителей в соответствии с требованиями Закона
                о персональных данных;
              </li>
              <li>
                сообщать в уполномоченный орган по защите прав субъектов
                персональных данных по запросу этого органа необходимую
                информацию в течение 10 дней с даты получения такого запроса;
              </li>
              <li>
                публиковать или иным образом обеспечивать неограниченный доступ
                к настоящей Политике в отношении обработки персональных данных;
              </li>
              <li>
                принимать правовые, организационные и технические меры для
                защиты персональных данных от неправомерного или случайного
                доступа к ним, уничтожения, изменения, блокирования,
                копирования, предоставления, распространения персональных
                данных, а также от иных неправомерных действий в отношении
                персональных данных;
              </li>
              <li>
                прекратить передачу (распространение, предоставление, доступ)
                персональных данных, прекратить обработку и уничтожить
                персональные данные в порядке и случаях, предусмотренных Законом
                о персональных данных;
              </li>
              <li>
                исполнять иные обязанности, предусмотренные Законом о
                персональных данных.
              </li>
            </ul>
          </section>

          {/* Раздел 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              4. Основные права и обязанности субъектов персональных данных
            </h2>
            <h3 className="font-medium text-black dark:text-white mt-3">
              4.1. Субъекты персональных данных имеют право:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                получать информацию, касающуюся обработки его персональных
                данных, за исключением случаев, предусмотренных федеральными
                законами;
              </li>
              <li>
                требовать от оператора уточнения его персональных данных, их
                блокирования или уничтожения в случае, если персональные данные
                являются неполными, устаревшими, неточными, незаконно
                полученными или не являются необходимыми для заявленной цели
                обработки;
              </li>
              <li>
                выдвигать условие предварительного согласия при обработке
                персональных данных в целях продвижения на рынке товаров, работ
                и услуг;
              </li>
              <li>
                на отзыв согласия на обработку персональных данных, а также на
                направление требования о прекращении обработки персональных
                данных;
              </li>
              <li>
                обжаловать в уполномоченный орган по защите прав субъектов
                персональных данных или в судебном порядке неправомерные
                действия или бездействие Оператора при обработке его
                персональных данных;
              </li>
              <li>
                на осуществление иных прав, предусмотренных законодательством
                РФ.
              </li>
            </ul>

            <h3 className="font-medium text-black dark:text-white mt-3">
              4.2. Субъекты персональных данных обязаны:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>предоставлять Оператору достоверные данные о себе;</li>
              <li>
                сообщать Оператору об уточнении (обновлении, изменении) своих
                персональных данных.
              </li>
            </ul>
          </section>

          {/* Раздел 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              5. Принципы обработки персональных данных
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>5.1.</strong> Обработка персональных данных
                осуществляется на законной и справедливой основе.
              </li>
              <li>
                <strong>5.2.</strong> Обработка персональных данных
                ограничивается достижением конкретных, заранее определенных и
                законных целей. Не допускается обработка персональных данных,
                несовместимая с целями сбора персональных данных.
              </li>
              <li>
                <strong>5.3.</strong> Не допускается объединение баз данных,
                содержащих персональные данные, обработка которых осуществляется
                в целях, несовместимых между собой.
              </li>
              <li>
                <strong>5.4.</strong> Обработке подлежат только персональные
                данные, которые отвечают целям их обработки.
              </li>
              <li>
                <strong>5.5.</strong> Содержание и объем обрабатываемых
                персональных данных соответствуют заявленным целям обработки. Не
                допускается избыточность обрабатываемых персональных данных по
                отношению к заявленным целям их обработки.
              </li>
              <li>
                <strong>5.6.</strong> При обработке персональных данных
                обеспечивается точность персональных данных, их достаточность, а
                в необходимых случаях и актуальность по отношению к целям
                обработки персональных данных. Оператор принимает необходимые
                меры и/или обеспечивает их принятие по удалению или уточнению
                неполных или неточных данных.
              </li>
              <li>
                <strong>5.7.</strong> Хранение персональных данных
                осуществляется в форме, позволяющей определить субъекта
                персональных данных, не дольше, чем этого требуют цели обработки
                персональных данных, если срок хранения персональных данных не
                установлен федеральным законом, договором, стороной которого,
                выгодоприобретателем или поручителем по которому является
                субъект персональных данных. Обрабатываемые персональные данные
                уничтожаются либо обезличиваются по достижении целей обработки
                или в случае утраты необходимости в достижении этих целей, если
                иное не предусмотрено федеральным законом.
              </li>
            </ul>
          </section>

          {/* Раздел 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              6. Цели обработки персональных данных
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>Цель обработки:</strong> Информирование Пользователя
                посредством отправки электронных писем
              </li>
              <li>
                <strong>Персональные данные:</strong> Фамилия, имя, отчество;
                номера телефонов
              </li>
              <li>
                <strong>Правовые основания:</strong> Федеральный закон «Об
                информации, информационных технологиях и о защите информации» от
                27.07.2006 N 149-ФЗ
              </li>
              <li>
                <strong>Виды обработки персональных данных:</strong> Сбор,
                запись, систематизация, накопление, хранение, уничтожение и
                обезличивание персональных данных
              </li>
            </ul>
          </section>

          {/* Раздел 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              7. Условия обработки персональных данных
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>7.1.</strong> Обработка персональных данных
                осуществляется с согласия субъекта персональных данных на
                обработку его персональных данных.
              </li>
              <li>
                <strong>7.2.</strong> Обработка персональных данных необходима
                для достижения целей, предусмотренных международным договором
                Российской Федерации или законом.
              </li>
              <li>
                <strong>7.3.</strong> Обработка персональных данных необходима
                для осуществления правосудия, исполнения судебного акта.
              </li>
              <li>
                <strong>7.4.</strong> Обработка персональных данных необходима
                для исполнения договора, стороной которого является субъект
                персональных данных.
              </li>
              <li>
                <strong>7.5.</strong> Обработка персональных данных необходима
                для реализации интересов оператора или третьих лиц.
              </li>
              <li>
                <strong>7.6.</strong> Обработка общедоступных персональных
                данных.
              </li>
              <li>
                <strong>7.7.</strong> Обработка персональных данных, подлежащих
                обязательному раскрытию.
              </li>
            </ul>
          </section>

          {/* Раздел 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              8. Порядок сбора, хранения, передачи и других видов обработки
              персональных данных
            </h2>
            <p className="text-black dark:text-white leading-relaxed">
              Безопасность персональных данных, которые обрабатываются
              Оператором, обеспечивается путем реализации правовых,
              организационных и технических мер, необходимых для выполнения в
              полном объеме требований действующего законодательства в области
              защиты персональных данных.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed mt-2">
              <li>
                <strong>8.1.</strong> Оператор обеспечивает сохранность
                персональных данных и принимает все возможные меры, исключающие
                доступ к данным неуполномоченных лиц.
              </li>
              <li>
                <strong>8.2.</strong> Персональные данные Пользователя никогда
                не передаются третьим лицам, за исключением случаев, связанных с
                законодательством или согласием Пользователя.
              </li>
              <li>
                <strong>8.3.</strong> В случае выявления неточностей в данных,
                пользователь может их актуализировать через e-mail.
              </li>
              <li>
                <strong>8.4.</strong> Срок обработки определяется достижением
                целей, но может быть изменён по согласию Пользователя.
              </li>
              <li>
                <strong>8.5.</strong> Информация, собранная сторонними
                сервисами, обрабатывается в соответствии с их политикой
                конфиденциальности.
              </li>
            </ul>
          </section>

          {/* Раздел 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              9. Перечень действий, производимых Оператором с полученными
              персональными данными
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>9.1.</strong> Оператор осуществляет сбор, запись,
                систематизацию, накопление, хранение, уточнение, извлечение,
                использование, передачу, обезличивание, блокирование, удаление и
                уничтожение персональных данных.
              </li>
              <li>
                <strong>9.2.</strong> Обработка персональных данных может быть
                автоматизированной с передачей информации по сетям.
              </li>
            </ul>
          </section>

          {/* Раздел 10 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              10. Трансграничная передача персональных данных
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-black dark:text-white leading-relaxed">
              <li>
                <strong>10.1.</strong> Оператор обязан уведомить уполномоченный
                орган о намерении осуществлять трансграничную передачу.
              </li>
              <li>
                <strong>10.2.</strong> Оператор должен получить соответствующие
                сведения от иностранного лица до передачи.
              </li>
            </ul>
          </section>

          {/* Раздел 11 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              11. Конфиденциальность персональных данных
            </h2>
            <p className="text-black dark:text-white leading-relaxed">
              Оператор и иные лица, получившие доступ к персональным данным,
              обязаны не раскрывать их третьим лицам без согласия субъекта
              персональных данных, если иное не предусмотрено законом.
            </p>
          </section>

          {/* Раздел 12 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              12. Заключительные положения
            </h2>
            <p className="text-black dark:text-white leading-relaxed">
              Пользователь может получить разъяснения, обратившись по адресу{" "}
              <a
                href="mailto:aleksandrzagornyj367@gmail.com"
                className="text-orange hover:underline"
              >
                aleksandrzagornyj367@gmail.com
              </a>
              . Актуальная версия Политики доступна по адресу{" "}
              <a href="/pk" className="text-orange hover:underline">
                {SITE_LINK}/pk
              </a>
              .
            </p>
          </section>

          <div className="text-center mt-8">
            <Link
              href="/glav"
              className="inline-flex items-center justify-center px-8 py-4 bg-orangeDefault text-white font-semibold rounded-2xl border-2 hover:bg-orangeDefaultHover transition-all duration-200"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
      <FeedbackLine />
    </>
  );
}
