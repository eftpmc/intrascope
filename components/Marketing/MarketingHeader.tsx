import clsx from "clsx";
import Link from "next/link";
import { ComponentProps } from "react";
import { signInWithGoogle } from "@/auth";
import { SignInIcon } from "@/icons";
import { Button } from "@/primitives/Button";
import { Container } from "@/primitives/Container";
import { Logo } from "../Logo";
import styles from "./MarketingHeader.module.css";

export function MarketingHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  return (
    <header className={clsx(className, styles.header)} {...props}>
      <Container className={styles.container}>
        <Link href="/">
          <Logo />
        </Link>
        <form onSubmit={(e) => { e.preventDefault(); signInWithGoogle(); }}>
          <Button icon={<SignInIcon />}>Sign in</Button>
        </form>
      </Container>
    </header>
  );
}
